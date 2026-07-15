import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, User, Users, Lock, BookOpen, GraduationCap, Image, Key, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import authService from '../services/authService';
import Logo from '../components/Logo';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const LOCAL_STORAGE_KEY = 'presenceone_onboarding_form';

export default function Register() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    accountType: 'STUDENT', // 'STUDENT' | 'FACULTY'
    // Personal Details
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: 'MALE',
    date_of_birth: '',
    // Academic Details (Student)
    roll_number: '',
    admission_number: '',
    department: '',
    course: '',
    current_semester: 1,
    section: 'A',
    year: '1',
    // Employment Details (Faculty)
    employee_id: '',
    faculty_id: '',
    designation: '',
    qualification: '',
    years_of_experience: '',
    joining_date: '',
    office_location: '',
    // Account Credentials
    password: '',
    confirmPassword: '',
    // Photo File (saved as DataURL for autosave simplicity)
    profilePhoto: '',
    acceptTerms: false
  });

  // Load Saved Form State on Load
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Autosave to LocalStorage when formData changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  // Fetch Departments and Courses for dropdowns
  useEffect(() => {
    const fetchMetadata = async () => {
      setIsLoadingMetadata(true);
      try {
        const depts = await authService.getDepartments();
        setDepartments(depts.results || depts);
        
        const crs = await authService.getCourses();
        setCourses(crs.results || crs);
      } catch (err) {
        toast.error('Failed to load departments and courses list.');
      } finally {
        setIsLoadingMetadata(false);
      }
    };
    fetchMetadata();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectRole = (role) => {
    setFormData((prev) => ({ ...prev, accountType: role }));
    handleNextStep();
  };

  // Image Upload handler
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profilePhoto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep = () => {
    // Basic step validation
    if (currentStep === 2) {
      if (!formData.first_name || !formData.last_name || !formData.email) {
        toast.error('First Name, Last Name, and Email are required.');
        return;
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        toast.error('Please enter a valid email address.');
        return;
      }
    }

    if (currentStep === 3) {
      if (formData.accountType === 'STUDENT') {
        if (!formData.roll_number || !formData.admission_number || !formData.department || !formData.course) {
          toast.error('Please fill in Roll Number, Admission Number, Department, and Course.');
          return;
        }
      } else {
        if (!formData.employee_id || !formData.department || !formData.designation) {
          toast.error('Please fill in Employee ID, Department, and Designation.');
          return;
        }
      }
    }

    if (currentStep === 4) {
      if (!formData.password || formData.password.length < 8) {
        toast.error('Password must be at least 8 characters long.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match.');
        return;
      }
    }

    if (currentStep === 5) {
      if (!formData.profilePhoto) {
        toast.error('Please upload a profile photo to proceed.');
        return;
      }
    }

    if (currentStep === 6) {
      if (!formData.acceptTerms) {
        toast.error('You must accept the terms & conditions.');
        return;
      }
      submitRegistration();
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const calculatePasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score; // Out of 5
  };

  const getPasswordStrengthLabel = (score) => {
    if (score === 0) return { text: 'Empty', color: 'bg-slate-200' };
    if (score <= 2) return { text: 'Weak', color: 'bg-danger' };
    if (score <= 4) return { text: 'Moderate', color: 'bg-warning' };
    return { text: 'Strong', color: 'bg-success' };
  };

  const submitRegistration = async () => {
    setIsSubmitting(true);
    try {
      if (formData.accountType === 'STUDENT') {
        const payload = {
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          roll_number: formData.roll_number,
          admission_number: formData.admission_number,
          department: parseInt(formData.department),
          course: parseInt(formData.course),
          current_semester: parseInt(formData.current_semester),
          date_of_birth: formData.date_of_birth || null
        };
        await authService.registerStudent(payload);
      } else {
        const payload = {
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          employee_id: formData.employee_id,
          designation: formData.designation,
          department: parseInt(formData.department),
          joining_date: formData.joining_date || null
        };
        await authService.registerFaculty(payload);
      }

      // Clear local storage on success
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      
      toast.success('Registration successful!', {
        icon: '🎉',
        style: {
          borderRadius: '12px',
          background: '#111827',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }
      });
      setCurrentStep(7); // success screen
    } catch (error) {
      // Extract backend error message
      const errs = error.response?.data;
      let errMsg = 'Onboarding submission failed. Check inputs.';
      if (errs) {
        if (typeof errs === 'object') {
          const keys = Object.keys(errs);
          if (keys.length > 0) {
            errMsg = `${keys[0].toUpperCase()}: ${errs[keys[0]][0] || errs[keys[0]]}`;
          }
        } else {
          errMsg = errs;
        }
      }
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { label: 'Role selection', icon: Users },
    { label: 'Personal info', icon: User },
    { label: 'Academic / Work', icon: BookOpen },
    { label: 'Credentials', icon: Key },
    { label: 'Profile Photo', icon: Image },
    { label: 'Verification', icon: Check }
  ];

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-slate-800 dark:text-slate-100 flex transition-colors duration-300">
      
      {/* LEFT SIDEBAR: Stepper Progress indicator (Hidden on small screen mobile) */}
      <div className="hidden md:flex w-80 bg-slate-950 text-white flex-col justify-between p-8 border-r border-slate-900 bg-grid-pattern relative">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        
        <div>
          <Logo variant="horizontal" theme="dark" className="mb-12" />
          
          {/* Stepper Progress */}
          <div className="space-y-6 relative">
            {stepsList.map((step, idx) => {
              const stepNumber = idx + 1;
              const isCompleted = currentStep > stepNumber;
              const isActive = currentStep === stepNumber;
              const Icon = step.icon;

              return (
                <div key={idx} className="flex items-center gap-4 text-left">
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-success border-success text-white'
                        : isActive
                        ? 'border-primary bg-primary/10 text-primary shadow-soft'
                        : 'border-slate-800 bg-transparent text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Step {stepNumber}</span>
                    <p className={`text-xs font-bold ${isActive ? 'text-slate-100' : 'text-slate-400'}`}>
                      {step.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-slate-600 border-t border-slate-900 pt-4 flex justify-between">
          <span>&copy; PresenceOne Onboarding</span>
          <span>Security Locked</span>
        </div>
      </div>

      {/* RIGHT SIDE: Wizards Form panel */}
      <div className="flex-grow flex items-center justify-center p-6 sm:p-12 md:p-16 relative bg-grid-pattern">
        
        {/* Glow Spheres */}
        <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-primary/5 dark:bg-primary/10 blur-[125px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-[100px]" />

        <div className="w-full max-w-xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 rounded-3xl shadow-premium relative z-10">
          
          {/* Header step indication for mobile screens */}
          <div className="md:hidden flex justify-between items-center mb-6">
            <Logo variant="icon" theme="light" className="dark:hidden" />
            <Logo variant="icon" theme="dark" className="hidden dark:block" />
            <span className="text-xs font-bold text-slate-400">Step {currentStep} of 7</span>
          </div>

          <AnimatePresence mode="wait">
            
            {/* STEP 1: Role Type */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="space-y-2 text-left">
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Choose account type</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    To configure your PresenceOne workspace, select your institutional profile role.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <button
                    onClick={() => handleSelectRole('STUDENT')}
                    className="p-6 text-left rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary dark:hover:border-primary bg-slate-50/50 dark:bg-slate-950/20 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all flex flex-col justify-between gap-6 active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">Student Profile</h4>
                      <p className="text-xs text-slate-500 mt-1">For learners to view compliance percentages, submit exemptions, and track attendance.</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectRole('FACULTY')}
                    className="p-6 text-left rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary dark:hover:border-primary bg-slate-50/50 dark:bg-slate-950/20 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all flex flex-col justify-between gap-6 active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">Faculty & Staff</h4>
                      <p className="text-xs text-slate-500 mt-1">For teachers, monitors, and principals to mark check-ins and review leave exemptions.</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Personal details */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="space-y-2 text-left">
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Personal Information</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Input your full legal name and official contact records.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Jane"
                    required
                  />
                  <Input
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Doe"
                    required
                  />
                </div>

                <Input
                  label="Official Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jane.doe@university.edu"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                  />
                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <Input
                  label="Date of Birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
              </motion.div>
            )}

            {/* STEP 3: Academic or Work Details */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                {formData.accountType === 'STUDENT' ? (
                  <>
                    <div className="space-y-2 text-left">
                      <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Academic Details</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Specify your enrollment credentials.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Register Number"
                        name="roll_number"
                        value={formData.roll_number}
                        onChange={handleChange}
                        placeholder="e.g. REG-2026-001"
                      />
                      <Input
                        label="Student ID"
                        name="admission_number"
                        value={formData.admission_number}
                        onChange={handleChange}
                        placeholder="e.g. ADM-987"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-left">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Department</label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        >
                          <option value="">Select Department</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Course</label>
                        <select
                          name="course"
                          value={formData.course}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        >
                          <option value="">Select Course</option>
                          {courses.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.code})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <Input
                        label="Semester"
                        name="current_semester"
                        type="number"
                        min="1"
                        max="8"
                        value={formData.current_semester}
                        onChange={handleChange}
                      />
                      <Input
                        label="Section"
                        name="section"
                        value={formData.section}
                        onChange={handleChange}
                        placeholder="A"
                      />
                      <Input
                        label="Year"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        placeholder="1"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2 text-left">
                      <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Employment Details</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Specify your professional details.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Employee ID"
                        name="employee_id"
                        value={formData.employee_id}
                        onChange={handleChange}
                        placeholder="e.g. EMP-101"
                      />
                      <Input
                        label="Faculty ID"
                        name="faculty_id"
                        value={formData.faculty_id}
                        onChange={handleChange}
                        placeholder="e.g. FAC-404"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-left">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Department</label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        >
                          <option value="">Select Department</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <Input
                        label="Designation"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        placeholder="e.g. Senior Lecturer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Office Location"
                        name="office_location"
                        value={formData.office_location}
                        onChange={handleChange}
                        placeholder="e.g. Block C, Room 12"
                      />
                      <Input
                        label="Joining Date"
                        name="joining_date"
                        type="date"
                        value={formData.joining_date}
                        onChange={handleChange}
                      />
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* STEP 4: Credentials */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="space-y-2 text-left">
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Account Credentials</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Secure your account with a high-entropy password.
                  </p>
                </div>

                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />

                {/* Password strength widget */}
                {formData.password && (
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-400">Password Strength:</span>
                      <span
                        className={
                          calculatePasswordStrength(formData.password) <= 2
                            ? 'text-danger'
                            : calculatePasswordStrength(formData.password) <= 4
                            ? 'text-warning'
                            : 'text-success'
                        }
                      >
                        {getPasswordStrengthLabel(calculatePasswordStrength(formData.password)).text}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 h-1.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      {[1, 2, 3, 4, 5].map((level) => {
                        const score = calculatePasswordStrength(formData.password);
                        const isFilled = score >= level;
                        const scoreColorObj = getPasswordStrengthLabel(score);
                        return (
                          <div
                            key={level}
                            className={`h-full rounded-full transition-colors ${
                              isFilled ? scoreColorObj.color : 'bg-transparent'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </motion.div>
            )}

            {/* STEP 5: Profile Image Upload */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="space-y-2 text-left">
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Profile Photo</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Upload a recent profile picture for digital check-in records.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center gap-6 py-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-950/10">
                  {formData.profilePhoto ? (
                    <div className="relative">
                      <img
                        src={formData.profilePhoto}
                        alt="Profile Preview"
                        className="w-32 h-32 rounded-full object-cover border-4 border-primary/20 shadow-soft"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, profilePhoto: '' }))}
                        className="absolute bottom-0 right-0 bg-danger text-white rounded-full p-1.5 shadow-md active:scale-90"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 rotate-45" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                      <Image className="w-10 h-10" />
                    </div>
                  )}

                  <div className="text-center">
                    <label className="cursor-pointer bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-xs font-bold shadow-soft transition-all inline-block active:scale-95">
                      Select Photo File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
                      JPEG or PNG format. Maximum file size: 2MB.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 6: Review Information */}
            {currentStep === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="space-y-2 text-left">
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Review & Confirm</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Verify your data parameters before establishing your account.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-left space-y-4 max-h-[300px] overflow-y-auto">
                  <div className="flex items-center gap-3">
                    {formData.profilePhoto ? (
                      <img
                        src={formData.profilePhoto}
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-sm">
                        {formData.first_name?.[0]}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        {formData.first_name} {formData.last_name}
                      </h4>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-primary">
                        {formData.accountType} Profile
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-550 border-t border-slate-100 dark:border-slate-850 pt-4">
                    <div>
                      <span className="text-slate-400 block">Email Address</span>
                      <p className="text-slate-800 dark:text-slate-200 truncate">{formData.email}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Phone Number</span>
                      <p className="text-slate-800 dark:text-slate-200">{formData.phone || 'N/A'}</p>
                    </div>

                    {formData.accountType === 'STUDENT' ? (
                      <>
                        <div>
                          <span className="text-slate-400 block">Roll / Register No</span>
                          <p className="text-slate-800 dark:text-slate-200 font-mono">{formData.roll_number}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Semester</span>
                          <p className="text-slate-800 dark:text-slate-200">Semester {formData.current_semester}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="text-slate-400 block">Employee ID</span>
                          <p className="text-slate-800 dark:text-slate-200 font-mono">{formData.employee_id}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Designation</span>
                          <p className="text-slate-800 dark:text-slate-200">{formData.designation}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Terms acceptance */}
                <div className="flex items-start gap-3 text-left pt-2">
                  <input
                    id="acceptTerms"
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-350 dark:border-slate-800 bg-white dark:bg-slate-900 mt-0.5"
                  />
                  <label htmlFor="acceptTerms" className="text-xs text-slate-450 dark:text-slate-400 leading-normal">
                    I acknowledge that all submitted data points are authentic. I accept the PresenceOne{' '}
                    <a href="#" className="text-primary hover:underline font-semibold">Terms of Service</a> and{' '}
                    <a href="#" className="text-primary hover:underline font-semibold">Privacy Policy</a>.
                  </label>
                </div>
              </motion.div>
            )}

            {/* STEP 7: Success Screen */}
            {currentStep === 7 && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-6"
              >
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-success">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Account Created!</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-medium">
                    Your PresenceOne profile has been configured successfully. You may now proceed to log in.
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => navigate('/login')}
                    variant="primary"
                    className="w-full max-w-[200px]"
                  >
                    Go to Login
                  </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Stepper Buttons (hidden on success step) */}
          {currentStep < 7 && (
            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 pt-6 mt-8">
              <Button
                onClick={handlePrevStep}
                variant="ghost"
                disabled={currentStep === 1}
                className="px-3"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </Button>
              
              {currentStep === 6 ? (
                <Button
                  onClick={handleNextStep}
                  variant="primary"
                  isLoading={isSubmitting}
                  className="px-6"
                >
                  Confirm & Onboard <Sparkles className="w-4 h-4 ml-1.5 text-yellow-300" />
                </Button>
              ) : (
                <Button
                  onClick={handleNextStep}
                  variant="primary"
                  className="px-6"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              )}
            </div>
          )}

          {/* Account Login Link */}
          {currentStep < 7 && (
            <div className="text-center mt-6">
              <span className="text-xs text-slate-450 dark:text-slate-400 font-medium">
                Already registered?{' '}
                <Link to="/login" className="text-primary hover:underline font-bold">
                  Sign In
                </Link>
              </span>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
