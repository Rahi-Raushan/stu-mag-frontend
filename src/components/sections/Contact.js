import React from 'react';

const Contact = () => {
  return (
    <section id="contact" className="section contact">
      <div className="container">
        <h2 className="section-title">Contact Us</h2>
        <div className="contact-grid">
          <div className="contact-item">
            <h3>Address</h3>
            <p>
              Rungta International Skills University<br />
              Bhilai Chhattisgarh<br />
              Chhattisgarh - 490024<br />
              India
            </p>
          </div>
          <div className="contact-item">
            <h3>Email</h3>
            <p>info@rungta.ac.in</p>
            <p>admissions@rungta.ac.in</p>
          </div>
          <div className="contact-item">
            <h3>Phone</h3>
            <p>9016-224444</p>
            <p>+91 9016225555</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;