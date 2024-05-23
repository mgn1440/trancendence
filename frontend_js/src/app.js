import { createElement } from "./lib/createElement";

const MyElement = ({className}) => {
  return createElement('div', {className}, 'Hello, World!');
}

const App = () => {
  return (
    createElement('div', null,
      createElement('div', null, '안녕?'),
      createElement(MyElement, {className: '111'}),
  ));
}


export default App;