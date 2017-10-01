# oneact
Reactive templating library

```javascript
function myDiv() {
  return state<string>("red", (getColor, setColor) => {
    return el("div", {
      style: () => `background: ${getColor()};`),
      onClick: () => setColor("green")
    }, () => `This div is ${getColor()}.`)
  });
}

El.append(document.body, myDiv());
```
