import { useEffect } from "react";
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

const Test = () => {
  useEffect(() => {
    const a = hljs.highlight('console.log(\'hello\');\nconst a = 5;', { language: 'js' });
    console.log(a);
  }, []);
  return <pre><code className="language-js">console.log('hello');{'\n'}const a = 5;</code></pre>;
};
export default Test;

