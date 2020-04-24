const templateZero = (userName, userId) => {
    text = 
    `<b>Hi ${userName},</b>
    <br/>
    <p>You're getting this message because it looks like you requested a password reset.</p>
    <p>You can reset your password through <a href="${process.env.REACT_APP_ADDRESS + "/reset/confirm/" + userId}">this link</a>.</p>
    <p>If you did <i>not</i> request this password reset, please <a href='mailto:deeter.cesler@gmail.com'>reach out to me immediately</a> and let me know.</p>`;
    return text;
}

module.exports = templateZero;