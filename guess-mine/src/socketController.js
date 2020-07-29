import events from "./events";

import { chooseWord } from "./words";

let sockets = [];
let inProgress = false;
let word= null;
let leader =null;

const chooseLeader = () => sockets[Math.floor(Math.random() * sockets.length)];

const socketController= (socket ,io)=> {
    const broadcast = (event, data)=> socket.broadcast.emit(event,data);
    const superBroadcast = (event, data)=> io.emit(event, data);
    const sendPlayerUpdate = () =>
        superBroadcast(events.playerUpdate, {sockets});

    const startGame= ()=> {
        if(inProgress == false){
            inProgress= true;
            leader =  chooseLeader();
            word = chooseWord();
            superBroadcast(events.starting);
            setTimeout (()=> {
                io.to( leader.id).emit(events.leaderNotif ,{word });
                superBroadcast(events.gameStarted);
            }, 2000);
        }
    };

    const endGame = () => {
        inProgress = false;
        superBroadcast(events.gameEnded);
    };

    const addPoints = (id)=> {
        sockets= sockets.map(socket =>{
            if(socket.id === id){
                socket.points +=10;
               
            } return socket;
        });
        sendPlayerUpdate();
    }

    socket.on(events.setNickname, ({nickname})=> {
        socket.nickname= nickname;
        sockets.push({ id:socket.id, points:0, nickname: nickname});
        broadcast.emit(events.newUser, {nickname});
        sendPlayerUpdate();
        if(sockets.length === 2 ){
            startGame();
        }
    });
    socket.on(events.disconnect, ()=>{
        sockets = socket.filter(aSocket => aSocket.id !== socket.id);
        if(sockets.length === 1 ){
            endGame();
        } else if(leader){
            if(leader.id ===socket.id){
                endGame();
            }
        }
        broadcast.emit(events.disconnected, {nickname:socket.nickname})
        sendPlayerUpdate();

    });

    socket.on(events.sendMsg , ({message})=> {
        if(message ===word){
            superBroadcast(events.newMsg, {message: `winner : ${socket.nickname} ,
            word was ${word}`,
            nickname: "Bot"});
            addPoints(socket.id); //이긴 사람
        }else{
            broadcast(events.newMsg, {message,nickname:socket.nickname});
        }
        
    });

    socket.on(events.beginPath, ({x,y})=> 
    broadcast(events.beganPath, {x, y})
    );

    socket.on(events.strokePath, ({x,y, color})=>
        broadcast(events.strokedPath, {x,y, color})
    );

    socket.on(events.fill, ({color})=>{
        broadcast(events.filled, {color });
    });
};

export default socketController;


