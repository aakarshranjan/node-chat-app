const users=[]

const addUser = ({id, username, room}) =>{
    //data clean
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //data validate
    if(!username || !room){
        return{
            error:'Username and room are required'
        }
    }

    //check for existing user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    if(existingUser){
        return{
            error:'Username in use'
        }
    }

    //store
    const user = {id,username,room}
    users.push(user)
    return {user}

}

const removeUser = (id)=>{
    const index = users.findIndex((user)=>{
        return user.id === id
    })

    if(index!==-1){
        return users.splice(index,1)[0]
    }
}

const getUser = (id) =>{
    const user = users.find((user)=>{
        return id === user.id
    })
    return user
}

const getUsersInRoom = (room) =>{
   return users.filter((user)=>{
       return user.room === room
    })
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}


