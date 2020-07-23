const users = []

const addUser = (id, username, room) => {
    // Clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Check that data is valid (does room exist, or name exist?)
    if (!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        // Check that there is only one user with this name and that the user with this name is in this room
        return user.room == room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is already in use'
        }
    }

    // Store user
    const user = {id, username, room}
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const userIndex = users.findIndex((user) => {
        return user.id === id
    })

    // If a user is not found, the number is -1. If a user is found, it is 0 or greater
    if (userIndex !== -1) {
        return users.splice(userIndex, 1)[0]
    }
}

const getUser = (id) => {
    const userExists = users.find((user) => {
        return user.id === id
    })

    if (!userExists) {
        return {
            error: 'User doesn\'t exist'
        }
    }

    return userExists
}

const getUsersInRoom = (room) => {
    const lowerCaseRoom = room.trim().toLowerCase()
    const activeUsers = users.filter((user) => {
        return user.room === lowerCaseRoom
    })

    if (activeUsers.length === 0) {
        return {
            status: `No active users in '${room}'`
        }
    }

    return activeUsers
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}