import { useEffect } from 'react';

export default (effect: any, deps: any, delay: any) => {
    useEffect(() => {
        const handler = setTimeout(() => effect(), delay);
        return () => clearTimeout(handler);
    }, [...deps || [], delay]);
};