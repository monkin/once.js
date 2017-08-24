import { El } from "./el";
/**
 * Delay element creation
 * @param create Element creation function
 * @param delay Element creation delay
 */
export declare function delay(create: () => El, delay: number): El;
/**
 * Call element update function only if it didn't called during a 'period'
 */
export declare function debounce(element: El, period: number): El;
/**
 * Call element update only once during period
 */
export declare function throttle(element: El, period: number): El;
/**
 * Call element update function every 'delay' milliseconds
 */
export declare function timer(element: El, delay: number): El;
