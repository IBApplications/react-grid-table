const callOrReturn = (funcOrValue, ...args) => {
    return typeof funcOrValue === 'function' ? funcOrValue(...args) : funcOrValue;
};

export default callOrReturn;