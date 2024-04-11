function sendEmail(form) {
  const serviceID = 'default_service';
  const templateID = 'template_1af7z0r';

  emailjs.sendForm(serviceID, templateID, form)
      .then((response) => {
          console.log('Success!', response.status, response.text);
          alert('Email sent successfully!');
          form.reset(); 
      }, (error) => {
          console.error('Failed...', error);
          alert('Failed to send email. Please try again later.');
      });
}
