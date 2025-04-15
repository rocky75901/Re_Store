import React, { useState } from 'react';
import Layout from '../components/layout';
import './faq.css';

const Faq = () => {
    const [openIndexes, setOpenIndexes] = useState([]); 

    const faqData = [
        { question: "Who can use this website?", answer: "Only students, faculty, and staff of IIT Kanpur can register and use the platform." },
        { question: "How do I receive payment?", answer: "Payments are processed through secure gateways. You can link your bank account for direct transfers." },
        { question: "Can I contact the seller?", answer: "Yes, you can contact the seller via the chat feature." },
        { question: "What if I receive a defective item?", answer: "You can report the issue within 24 hours of receiving the item for a resolution." },
        { question: "Can I edit or delete my listing after posting?", answer: "Yes, you can remove your listing from the Sell History section but you can't edit your listing." },
    ];

    const toggleFAQ = (index) => {
        setOpenIndexes((prevIndexes) =>
            prevIndexes.includes(index)
                ? prevIndexes.filter((i) => i !== index) 
                : [...prevIndexes, index] 
        );
    };

    return (
        <Layout showHeader={false}>
            <h1 className="faq-h1">Hi, How can we help you?</h1>
            
            <div className="faq-container">
            <h2 className="faq-heading">FAQs</h2>
                {faqData.map((item, index) => (
                    <div key={index} className={`faq-qitem ${openIndexes.includes(index) ? "open" : ""}`}>
                        <button className="faq-question" onClick={() => toggleFAQ(index)}>
                            <span>{index + 1}. {item.question}</span>
                            <i className={`fa-solid ${openIndexes.includes(index) ? "fa-angle-up" : "fa-angle-down"}`}></i>
                        </button>
                        <div className="faq-aitem" style={{ maxHeight: openIndexes.includes(index) ? "200px" : "0px" }}>
                            <p className="faq-answer"><i className="fa-solid fa-circle-dot"></i> &nbsp; {item.answer}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Layout>
    );
};

export default Faq;
