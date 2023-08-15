// export default interface Event {
//     name: string;
//     once?: boolean;
//     execute: (...args: any[]) => any;
// }


export default interface Event<T extends unknown[]> {
    name: string;
    once?: boolean;
    execute: (...args: T) => void;  // Adjust the return type if needed.
}