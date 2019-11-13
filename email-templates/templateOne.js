const templateOne = (name) => {
    text = 
    `<div>
        <h1>Hello world</h1>
        <p>This is a test to see if template one is working.</p>
        <h3><i>Also,</i> I want to see if a name, like ${name} can be passed through.</h3>
    </div>`;

    return text;
    }

module.exports = templateOne;