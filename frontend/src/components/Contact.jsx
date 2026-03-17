import React, { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [status, setStatus] = useState(null); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    const csrftoken = getCookie('csrftoken');

    const payload = {
      ...formData,
      'cf-turnstile-response': turnstileToken,
    };
    
    const response = await fetch('/api/email/contact/', {
      method: 'POST',
      credentials: 'include',
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken, 
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setStatus('success'); 
      
      // Reset form fields immediately so user sees they are cleared
      setFormData({ name: '', email: '', message: '' });

      // After 5 seconds, hide the success message
      setTimeout(() => {
          setStatus(null); 
      }, 5000);
    } else {
      setStatus('error');
    }
  };

  // REMOVED: The "if (status === 'success') return ..." block that was causing the jump.

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100 space-y-6">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Get in Touch</h2>
          <p className="text-sm text-gray-500 mt-1">I'll get back to you as soon as possible.</p>
        </div>

        <div className="text-left">
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
          <input
            id="name"
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Audrius ..."
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>

        <div className="text-left">
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
          <input
            id="email"
            type="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="name@example.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>

        <div className="text-left">
          <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
          <textarea
            id="message"
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Tell me about your project..."
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={status === 'loading'}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 shadow-lg shadow-blue-200"
        >
          {status === 'loading' ? 'Sending...' : 'Send Message'}
        </button>

        <div className="flex justify-center py-2">
          <Turnstile 
            siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
            onSuccess={(token) => setTurnstileToken(token)} 
          />
        </div> 

        {/* This is the message in the RIGHT place (bottom of the form) */}
        {status === 'success' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
            <p className="text-green-600 text-center text-sm font-medium">
              ✅ Message sent successfully!
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-center text-sm font-medium">
              ❌ Something went wrong. Please try again.
            </p>
          </div>
        )}
      </form>
    </section>
  );
};

export default Contact;