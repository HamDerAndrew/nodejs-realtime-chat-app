const createMsg = (text) => {
    return {
        text,
        createdAt: new Date().getTime()
    }
}

const createLocationMsg = (url) => {
    return {
        url,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    createMsg,
    createLocationMsg
}