import React from 'react'
import DynamicForm from '../../'

function App() {
  const formDefinition = {
    fields: [
      {
        type: 'header',
        label: 'Contact Form Demo',
        size: 'xl',
        underline: true
      },
      {
        type: 'alert',
        variant: 'info',
        message: 'Please fill out all required fields below.'
      },
      {
        name: 'name',
        label: 'Full Name',
        type: 'input',
        required: true,
        placeholder: 'Enter your full name',
        containerStyle: 'card',
        color: 'blue'
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'you@example.com'
      },
      {
        name: 'subject',
        label: 'Subject',
        type: 'select',
        required: true,
        options: [
          { value: '', label: 'Select a subject' },
          { value: 'general', label: 'General Inquiry' },
          { value: 'support', label: 'Technical Support' },
          { value: 'billing', label: 'Billing Question' },
          { value: 'feature', label: 'Feature Request' }
        ]
      },
      {
        name: 'priority',
        label: 'Priority Level',
        type: 'radiogroup',
        required: true,
        inline: true,
        color: 'green',
        options: [
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' }
        ]
      },
      {
        name: 'message',
        label: 'Message',
        type: 'textarea',
        required: true,
        rows: 5,
        maxLength: 1000,
        showCharCount: true,
        placeholder: 'Please describe your inquiry...'
      },
      {
        name: 'newsletter',
        label: 'Subscribe to our newsletter',
        type: 'checkbox',
        layout: 'inline',
        description: 'Get weekly updates and special offers'
      }
    ]
  };

  const handleSubmit = (values) => {
    alert('Form submitted successfully! Check the console for values.');
  };

  const handleFieldsChange = (values) => {
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Dynamic Form Package Test
          </h1>
          <DynamicForm
            formDefinition={formDefinition}
            onSubmit={handleSubmit}
            onFieldsChange={handleFieldsChange}
          />


        </div>
      </div>
    </div>
  )
}

export default App