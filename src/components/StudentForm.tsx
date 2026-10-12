import { useState, type ChangeEvent, type FormEvent } from "react";
import "./StudentForm.css";

interface StudentFormData {
  name: string;
  email: string;
  course: string;
}

interface LaravelResponse {
  message?: string;
  errors?: Record<string, string[]>;
  student?: {
    id: number;
    name: string;
    email: string;
    course: string;
  };
}

const initialForm: StudentFormData = {
  name: "",
  email: "",
  course: "",
};

export default function StudentForm() {
  const [form, setForm] = useState<StudentFormData>(initialForm);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Update form values when the user types or selects a course
  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Send form data to the Laravel API
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/students",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data: LaravelResponse = await response.json();

      // Display Laravel validation or server errors
      if (!response.ok) {
        const errors = data.errors
          ? Object.values(data.errors).flat().join(" ")
          : data.message || "Registration failed. Please try again.";

        throw new Error(errors);
      }

      // Display success message and clear the form
      setMessage(
        data.message || "Student registered successfully!"
      );

      setIsError(false);
      setForm(initialForm);
    } catch (error) {
      setIsError(true);

      if (error instanceof TypeError) {
        setMessage(
          "Unable to connect to the Laravel server. Please check that the backend is running."
        );
      } else {
        setMessage(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="registration-card">
      <div className="heading">
        <span className="eyebrow">STUDENT PORTAL</span>

        <h1>Student Registration</h1>

        <p>Enter your details to register for a course.</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Full Name */}
        <div className="form-group">
          <label htmlFor="name">Full Name</label>

          <input
            id="name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            maxLength={255}
            autoComplete="name"
            required
          />
        </div>

        {/* Email Address */}
        <div className="form-group">
          <label htmlFor="email">Email Address</label>

          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            maxLength={255}
            autoComplete="email"
            required
          />
        </div>

        {/* Course Selection */}
        <div className="form-group">
          <label htmlFor="course">Select Course</label>

          <select
            id="course"
            name="course"
            value={form.course}
            onChange={handleChange}
            required
          >
            <option value="">Choose a course</option>
            <option value="Computer Science">
              Computer Science
            </option>
            <option value="Information Technology">
              Information Technology
            </option>
            <option value="Business Administration">
              Business Administration
            </option>
          </select>
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register Student"}
        </button>

        {/* Success or Error Message */}
        {message && (
          <p
            className={`message ${isError ? "error" : "success"}`}
            role="status"
            aria-live="polite"
          >
            {message}
          </p>
        )}
      </form>

      <p className="footer-text">
        Powered by React, Laravel and MySQL
      </p>
    </section>
  );
}