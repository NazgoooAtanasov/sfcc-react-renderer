import { useState } from 'react';

export type HomeReactProps = {
    title: string;
    message: string;
};

export default function HomeReact({ title, message }: HomeReactProps) {
    const [count, setCount] = useState(0);

    return (
        <section className="react-ssr-home" data-component="HomeReact">
            <h1>{title}</h1>
            <p>{message}</p>
            <button type="button" onClick={() => setCount((s) => s + 1)}>
                {count}
            </button>
        </section>
    );
}
