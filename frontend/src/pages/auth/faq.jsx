import React from 'react'
import Layout from './layout'
import { useState } from "react";
import "./faq.css"

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="faq-item">
            <button className="faq-question" onClick={() => setIsOpen(!isOpen)}>
                {question}
                <span className="arrow">{isOpen ? <i class="fa-solid fa-angle-up"></i> : <i class="fa-solid fa-angle-down"></i>}</span>
            </button>
            {isOpen && <p className="faq-answer"><i class="fa-solid fa-circle-dot"></i> &nbsp; {answer}</p>}
        </div>
    );
};


const Faq = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqData = [
        {
            question: "Who can use this website?",
            answer: "Only students, faculty, and staff of IIT Kanpur can register and use the platform.",
        },
        {
            question: "How do I receive payment?",
            answer: "Payments are processed through secure gateways. You can link your bank account for direct transfers.",
        },
        {
            question: "Can I negotiate the price?",
            answer: "Yes, you can negotiate the price with the seller via the chat feature.",
        },
        {
            question: "What if I receive a defective item?",
            answer: "You can report the issue within 24 hours of receiving the item for a resolution.",
        },
        {
            question: "Can I edit or delete my listing after posting?",
            answer: "Yes, you can edit or remove your listing from the 'My Orders' section.",
        },
    ];


    return (
        <Layout showHeader = {false} >
            <h1 className="faq-h1" style={{color:'black'}}>Hi, How can we help you ?</h1>
            <div className="faq-container">
                <h2 className='faq-heading' style = {{borderRadius:"35px", padding:"15px 45px"}}>FAQs</h2>
                {faqData.map((item, index) => (
                    <FAQItem key={index} {...item} />
                ))}
            </div>
        </Layout>
    )
};

export default Faq;