const createMsg = (username,text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const createLocationMsg = (username, url) => {
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    createMsg,
    createLocationMsg
}