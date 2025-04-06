import React from "react";
import Layout from "../components/layout";
import "./contactUs.css";

const ContactForm = () => {
  return (
    <Layout showHeader={false}>
      <div className="contact-container">
        {/* White Background Form */}
        <div className= "title"> Contact Us </div>
        <form className="contact-form-container">
          <div className="contact-form">
            <h2>Send us a message</h2>
            <p>
              Feel free to use the form or drop us an email.Old-fashioned phone calls work too.            </p>
            <div className="form-group">
                <p> Name</p>
              <input type="text" placeholder="Enter your name" />
              <p> E-mail</p>
              <input type="email" placeholder="Enter your email" />
              <p> Message</p>
              <textarea placeholder="Type your message here..."></textarea>
            </div>
            <button class="button">Send Now</button>

          </div>

          {/* Contact Info */}
          <div className="contact-info">
            <div className="info-item">
              <i className="fas fa-map-marker-alt"></i>
              <p> Address : KD Lab, IIT Kanpur, UP 208016</p>
            </div>
            <div className="info-item">
              <i className="fas fa-phone"></i>
              <p> Phone : xxxxxxxxxx</p>
            </div>
            <div className="info-item">
              <i className="fas fa-envelope"></i>
              <p> Email : Re_Store@gmail.com</p>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ContactForm;
