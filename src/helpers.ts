export const guidGenerator = () : string => {
    const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
};

export const randomFromArray = (array: any[]) : any => array[Math.floor(Math.random() * array.length)];