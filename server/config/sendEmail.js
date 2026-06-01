import { sendEmail } from "./emailService.js";

const sendEmailFun = async ({ sendTo, subject, text, html }) => {
    console.log('=== EMAIL SERVICE DEBUG ===');
    console.log('sendTo:', sendTo);
    console.log('subject:', subject);
    
    const result = await sendEmail(sendTo, subject, text, html);
    
    console.log('Email result:', result);
    console.log('=== END EMAIL DEBUG ===');
    
    return result;
};

export default sendEmailFun;