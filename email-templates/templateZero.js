const templateZero = (userEmail, contactEmail, contactName, contactSummary) => {
    text = 
    `<b>Hi ${userEmail},</b>
    <br/>
    <p>According to the reminder you sent, it's time to reach out to <strong>${contactName}</strong>. Their email is <a href="mailto:${contactEmail}">${contactEmail}</a>.</p>
    <p>Here's what you said it's important to know about them, or what you discussed recently: <br/> ${contactSummary}. <br/> <br/> If you want to update what you talked about, you can <a href="${process.env.REACT_APP_ADDRESS + "/contacts/all"}">do that here</a>.</p>`;
    return text;
}

module.exports = templateZero;