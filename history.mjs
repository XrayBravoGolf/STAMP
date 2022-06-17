/*
    Stub module storing one state, the latest history Id
    Designed to be used as singleton class
*/

let historyId;

const setHistoryId = (id) => {
    historyId = id;
}

const getHistoryId = () => {
    return historyId;
}

export { setHistoryId, getHistoryId };