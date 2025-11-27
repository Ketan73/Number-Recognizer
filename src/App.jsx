import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { recognizeDigits } from './services/gemini';
import { signUp, signIn, signInWithGoogle, logOut, subscribeToAuthChanges, resetPassword, resendVerificationEmail, updateUserProfile } from './services/auth';
import { saveRecognition, getHistory } from './services/storage';
import Tooltip from './components/Tooltip';

const Container = styled.div`
  min-height: 100vh;
  width: 100%;
  background: #f5f3eb;
  background-image: 
    linear-gradient(#e8e6de 1px, transparent 1px);
  background-size: 100% 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
`;

const TooltipWrapper = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
`;

const Title = styled.h1`
  font-family: 'Literata', serif;
  font-size: 52px;
  font-weight: 600;
  color: #2c2c2c;
  margin-bottom: 8px;
  text-align: center;
`;

const Subtitle = styled.p`
  font-family: 'Literata', serif;
  font-size: 18px;
  color: #666;
  margin-bottom: 40px;
  text-align: center;
  font-style: italic;
`;

const UploadBox = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 380px;
  padding: 50px 40px;
  background: #fff;
  border: 2px dashed #2c2c2c;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: 4px;
    bottom: 4px;
    border: 2px solid transparent;
    border-radius: 8px;
    transition: all 0.2s;
  }

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0 #2c2c2c;
  }

  input {
    display: none;
  }

  svg {
    width: 72px;
    height: 72px;
    fill: #2c2c2c;
    margin-bottom: 16px;
    opacity: 0.7;
  }

  p {
    font-family: 'Literata', serif;
    color: #555;
    font-size: 18px;
    margin: 4px 0;
  }
`;

const BrowseButton = styled.span`
  margin-top: 16px;
  padding: 10px 28px;
  background: #2c2c2c;
  border-radius: 4px;
  color: #fff;
  font-family: 'Literata', serif;
  font-size: 18px;
  transition: all 0.2s;
  box-shadow: 2px 2px 0 #1a1a1a;

  ${UploadBox}:hover & {
    background: #444;
  }
`;

const PreviewBox = styled.div`
  width: 100%;
  max-width: 380px;
  background: #fff;
  border: 2px solid #2c2c2c;
  border-radius: 8px;
  padding: 20px;
  position: relative;
  box-shadow: 4px 4px 0 #2c2c2c;
`;

const PreviewImage = styled.img`
  width: 100%;
  max-height: 220px;
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: -12px;
  right: -12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #2c2c2c;
  color: #2c2c2c;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 2px 2px 0 #2c2c2c;
  transition: all 0.2s;

  svg {
    width: 14px;
    height: 14px;
    stroke: #2c2c2c;
    stroke-width: 2.5;
    stroke-linecap: round;
  }

  &:hover {
    background: #f0f0f0;
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0 #2c2c2c;
  }
`;

const RecognizeButton = styled.button`
  margin-top: 28px;
  padding: 14px 20px;
  background: #d1fca0ff;
  color: #000000ff;
  border: 2px solid #2c2c2c;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 3px 3px 0 #1a1a1a;
  font-family: 'Literata', serif;

  &:hover {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 #1a1a1a;
  }
`;

const ResultBox = styled.div`
  margin-top: 36px;
  text-align: center;
  width: 100%;
  max-width: 90vw;
`;

const ResultLabel = styled.p`
  font-family: 'Literata', serif;
  font-size: 18px;
  color: #666;
  margin-bottom: 12px;
`;

const CheckBadge = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  width: 28px;
  height: 28px;
  background: #4ade80;
  border: 2px solid #2c2c2c;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 14px;
    height: 14px;
    fill: none;
    stroke: #2c2c2c;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

const ResultNumber = styled.div`
  min-width: 120px;
  width: fit-content;
  max-width: 90vw;
  min-height: 80px;
  padding: 16px 24px;
  background: #fff;
  border: 3px solid #2c2c2c;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Literata', serif;
  font-size: 48px;
  font-weight: 600;
  color: #2c2c2c;
  margin: 0 auto;
  box-shadow: 4px 4px 0 #2c2c2c;
  position: relative;
  white-space: pre-wrap;
  text-align: center;
  letter-spacing: 4px;
  line-height: 1.3;
`;

const LoaderWrapper = styled.div`
  margin: 36px auto 0;
  display: flex;
  justify-content: center;
  
  .loader {
    width: 50px;
    height: 50px;
    position: relative;
    z-index: 1;
  }

  .loader::before, 
  .loader::after {
    content: '';
    position: absolute;
    width: inherit;
    height: inherit;
    border-radius: 50%;
    mix-blend-mode: multiply;
    animation: rotate92523 2s infinite cubic-bezier(0.77, 0, 0.175, 1);
  }

  .loader::before {
    background-color: #75e2ff;
  }

  .loader::after {
    background-color: #ff8496;
    animation-delay: 1s;
  }

  @keyframes rotate92523 {
    0%, 100% {
      left: 35px;
    }

    25% {
      transform: scale(.3);
    }

    50% {
      left: 0%;
    }

    75% {
      transform: scale(1);
    }
  }
`;

const Loader = () => (
  <LoaderWrapper>
    <div className="loader" />
  </LoaderWrapper>
);

const ErrorText = styled.p`
  margin-top: 24px;
  color: #e53935;
  font-family: 'Literata', serif;
  font-size: 18px;
  text-align: center;
  font-style: italic;
`;

const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 100;
`;

const AuthButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 8px 16px;
  background: #fff;
  border: 2px solid #2c2c2c;
  border-radius: 6px;
  color: #2c2c2c;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 2px 2px 0 #2c2c2c;
  font-family: 'Literata', serif;

  &:hover {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0 #2c2c2c;
  }
`;

const UserInfo = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  background: #2c2c2c;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-family: 'Literata', serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const Greeting = styled.p`
  font-family: 'Literata', serif;
  font-size: 24px;
  color: #2c2c2c;
  margin-bottom: 8px;
  text-align: center;
`;

const ProfileModal = styled.div`
  background: #fff;
  border: 2px solid #2c2c2c;
  border-radius: 12px;
  padding: 28px;
  max-width: 380px;
  width: 100%;
  box-shadow: 6px 6px 0 #2c2c2c;
  position: relative;

  h2 {
    font-family: 'Literata', serif;
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 20px;
    text-align: center;
    color: #2c2c2c;
  }
`;

const ProfileSection = styled.div`
  margin-bottom: 20px;

  label {
    font-family: 'Literata', serif;
    font-size: 14px;
    color: #666;
    display: block;
    margin-bottom: 6px;
  }
`;

const ProfileEmail = styled.p`
  font-family: 'Literata', serif;
  font-size: 14px;
  color: #2c2c2c;
  background: #f5f3eb;
  padding: 10px 12px;
  border-radius: 6px;
  margin: 0;
`;

const ProfileButton = styled.button`
  width: 100%;
  padding: 10px;
  background: ${props => props.$secondary ? '#fff' : '#2c2c2c'};
  color: ${props => props.$secondary ? '#2c2c2c' : '#fff'};
  border: 2px solid #2c2c2c;
  border-radius: 6px;
  font-family: 'Literata', serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 10px;

  &:hover {
    background: ${props => props.$secondary ? '#f5f5f5' : '#444'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const LogoutButton = styled.button`
  padding: 8px 16px;
  background: #fff;
  border: 2px solid #2c2c2c;
  border-radius: 6px;
  color: #2c2c2c;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 2px 2px 0 #2c2c2c;
  font-family: 'Literata', serif;

  &:hover {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0 #2c2c2c;
  }
`;

const HistoryButton = styled.button`
  position: absolute;
  top: 20px;
  right: 70px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #2c2c2c;
  color: #2c2c2c;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 2px 2px 0 #2c2c2c;

  svg {
    width: 18px;
    height: 18px;
    stroke: #2c2c2c;
    stroke-width: 2;
    fill: none;
  }

  &:hover {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0 #2c2c2c;
  }
`;

const AuthModal = styled.div`
  background: #fff;
  border: 2px solid #2c2c2c;
  border-radius: 12px;
  padding: 28px;
  max-width: 420px;
  width: 100%;
  box-shadow: 6px 6px 0 #2c2c2c;
  position: relative;

  h2 {
    font-family: 'Literata', serif;
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 20px;
    text-align: center;
    color: #2c2c2c;
  }
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #2c2c2c;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  svg {
    width: 12px;
    height: 12px;
    stroke: #2c2c2c;
    stroke-width: 2.5;
    stroke-linecap: round;
  }

  &:hover {
    background: #f0f0f0;
  }
`;

const AuthInput = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 12px;
  border: 2px solid #2c2c2c;
  border-radius: 6px;
  font-family: 'Literata', serif;
  font-size: 16px;
  outline: none;

  &:focus {
    box-shadow: 2px 2px 0 #2c2c2c;
  }

  &::placeholder {
    font-family: 'Literata', serif;
    color: #999;
  }
`;

const AuthSubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #2c2c2c;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-family: 'Literata', serif;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 12px;
  transition: all 0.2s;

  &:hover {
    background: #444;
  }

  &:disabled {
    background: #999;
    cursor: not-allowed;
  }
`;

const GoogleButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #fff;
  color: #2c2c2c;
  border: 2px solid #2c2c2c;
  border-radius: 6px;
  font-family: 'Literata', serif;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
  }
`;

const AuthToggle = styled.p`
  text-align: center;
  margin-top: 16px;
  font-family: 'Literata', serif;
  font-size: 16px;
  color: #666;

  span {
    color: #2c2c2c;
    cursor: pointer;
    font-weight: 600;
    text-decoration: underline;
  }
`;

const ForgotPassword = styled.p`
  text-align: right;
  margin-bottom: 16px;
  margin-top: -4px;
  font-family: 'Literata', serif;
  font-size: 14px;
  color: #666;
  cursor: pointer;

  &:hover {
    color: #2c2c2c;
    text-decoration: underline;
  }
`;

const SuccessText = styled.p`
  margin-top: 0;
  margin-bottom: 12px;
  color: #22c55e;
  font-family: 'Literata', serif;
  font-size: 16px;
  text-align: center;
`;

const VerificationBanner = styled.div`
  position: absolute;
  top: 100px;
  left: 20px;
  max-width: 360px;
  background: #fffbeb;
  border: 2px solid #2c2c2c;
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 3px 3px 0 #2c2c2c;
  z-index: 10;

  p {
    font-family: 'Literata', serif;
    font-size: 14px;
    color: #2c2c2c;
    margin: 0;
    line-height: 1.4;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
`;

const VerificationButtons = styled.div`
  display: flex;
  gap: 10px;

  button {
    padding: 8px 14px;
    border: 2px solid #2c2c2c;
    border-radius: 6px;
    font-family: 'Literata', serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:first-child {
      background: #2c2c2c;
      color: #fff;

      &:hover {
        background: #444;
      }

      &:disabled {
        background: #888;
        cursor: not-allowed;
      }
    }

    &:last-child {
      background: #fff;
      color: #2c2c2c;

      &:hover {
        background: #f5f5f5;
      }
    }
  }
`;

const SaveButton = styled.button`
  margin-top: 16px;
  padding: 10px 20px;
  background: #fff;
  color: #2c2c2c;
  border: 2px solid #2c2c2c;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 2px 2px 0 #2c2c2c;
  font-family: 'Literata', serif;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  svg {
    width: 16px;
    height: 16px;
    stroke: #2c2c2c;
  }

  &:hover {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0 #2c2c2c;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const HistoryPanel = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 100%;
  max-width: 380px;
  background: #fff;
  border-left: 2px solid #2c2c2c;
  padding: 24px;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  z-index: 101;
  overflow-y: auto;
  transform: translateX(${props => props.$isOpen ? '0' : '100%'});
  transition: transform 0.3s ease-in-out;

  h2 {
    font-family: 'Literata', serif;
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #2c2c2c;
  }
`;

const HistoryOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 100;
  opacity: ${props => props.$isOpen ? '1' : '0'};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
`;

const HistoryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
    border-color: #ccc;
  }

  img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid #ddd;
  }

  .details {
    flex: 1;
  }

  .title {
    font-family: 'Literata', serif;
    font-size: 15px;
    font-weight: 500;
    color: #2c2c2c;
    margin-bottom: 4px;
  }

  .date {
    font-family: 'Literata', serif;
    font-size: 13px;
    color: #888;
  }
`;

const EmptyHistory = styled.p`
  text-align: center;
  color: #888;
  font-family: 'Literata', serif;
  font-size: 18px;
  font-style: italic;
  padding: 20px;
`;

const CloudUploadIcon = () => (
  <svg viewBox="0 0 640 512" fill="#2c2c2c">
    <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);

const HistoryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
);

const SaveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

function App() {
  const [preview, setPreview] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      if (isResetPassword) {
        await resetPassword(email);
        setAuthSuccess("Password reset email sent! Check your inbox.");
        setEmail('');
      } else if (isSignUp) {
        await signUp(email, password);
        setAuthSuccess('Account created! Please check your email to verify your account.');
        setEmail('');
        setPassword('');
        setTimeout(() => {
          closeAuthModal();
        }, 2500);
      } else {
        await signIn(email, password);
        closeAuthModal();
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      await signInWithGoogle();
      closeAuthModal();
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setIsSignUp(false);
    setIsResetPassword(false);
    setEmail('');
    setPassword('');
    setAuthError('');
    setAuthSuccess('');
  };

  const handleResendVerification = async () => {
    setResendingVerification(true);
    setVerificationMessage('');
    try {
      await resendVerificationEmail();
      setVerificationMessage('Verification email sent! Check your inbox.');
    } catch (err) {
      setVerificationMessage(err.message);
    } finally {
      setResendingVerification(false);
    }
  };

  const refreshUserVerification = async () => {
    if (user) {
      try {
        const { auth } = await import('./services/firebase');
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          setVerificationMessage('Please sign in again.');
          return;
        }
        
        await currentUser.reload();
        
        if (currentUser.emailVerified) {
          setUser({ ...currentUser });
          setVerificationMessage('Email verified successfully!');
          setTimeout(() => setVerificationMessage(''), 2000);
        } else {
          setVerificationMessage('Email not verified yet. Please check your inbox and click the verification link.');
        }
      } catch (err) {
        console.error('Verification check error:', err);
        setVerificationMessage('Failed to check verification status. Please try again.');
      }
    }
  };

  const openProfileModal = () => {
    setDisplayName(user?.displayName || '');
    setProfileMessage({ type: '', text: '' });
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setProfileMessage({ type: '', text: '' });
  };

  const handleUpdateName = async () => {
    if (!displayName.trim()) {
      setProfileMessage({ type: 'error', text: 'Please enter a name' });
      return;
    }
    setSavingName(true);
    setProfileMessage({ type: '', text: '' });
    try {
      await updateUserProfile(displayName.trim());
      setUser({ ...user, displayName: displayName.trim() });
      setProfileMessage({ type: 'success', text: 'Name updated!' });
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.message });
    } finally {
      setSavingName(false);
    }
  };

  const handleProfileResetPassword = async () => {
    setResettingPassword(true);
    setProfileMessage({ type: '', text: '' });
    try {
      await resetPassword(user.email);
      setProfileMessage({ type: 'success', text: 'Password reset email sent!' });
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.message });
    } finally {
      setResettingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      setHistory([]);
      setPreview(null);
      setImageData(null);
      setResult(null);
      setError(null);
      setSaved(false);
      setShowHistory(false);
    } catch (err) {
      console.error('Logout failed:', err);
      alert('Failed to sign out. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!user || !imageData || !result) return;

    setSaving(true);
    try {
      await saveRecognition(user.uid, imageData, result);
      setSaved(true);
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const loadHistory = async () => {
    if (!user) return;

    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await getHistory(user.uid);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
      setHistoryError(err.message || 'Failed to load history. Please try again.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const openHistory = () => {
    setShowHistory(true);
    loadHistory();
  };

  const processFile = (file) => {
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
      alert('Please upload a JPEG or PNG image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setImageData(e.target.result);
      setResult(null);
      setError(null);
      setSaved(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const clearImage = () => {
    setPreview(null);
    setImageData(null);
    setResult(null);
    setError(null);
  };

  const loadHistoryItem = (item) => {
    setPreview(item.imageUrl);
    setImageData(item.imageUrl);
    setResult(item.recognizedNumber);
    setError(null);
    setSaved(true);
    setShowHistory(false);
  };

  const handleRecognize = async () => {
    if (!imageData) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const digits = await recognizeDigits(imageData);
      setResult(digits);
    } catch (err) {
      setError(err.message || 'Failed to recognize digits');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      {user ? (
        <UserInfo>
          <UserAvatar onClick={openProfileModal} title="Profile settings">
            {(user.displayName || user.email)?.charAt(0).toUpperCase()}
          </UserAvatar>
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </UserInfo>
      ) : (
        <AuthButton onClick={() => setShowAuthModal(true)}>Sign In</AuthButton>
      )}

      {user && user.emailVerified && <HistoryButton onClick={openHistory} title="History"><HistoryIcon /></HistoryButton>}

      {user && !user.emailVerified && (
        <VerificationBanner>
          <p>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Please verify your email to save recognitions.
          </p>
          {verificationMessage && (
            <p style={{ color: verificationMessage.includes('sent') ? '#22c55e' : '#e53935', fontStyle: 'italic' }}>
              {verificationMessage}
            </p>
          )}
          <VerificationButtons>
            <button onClick={handleResendVerification} disabled={resendingVerification}>
              {resendingVerification ? 'Sending...' : 'Resend Email'}
            </button>
            <button onClick={refreshUserVerification}>
              I've Verified
            </button>
          </VerificationButtons>
        </VerificationBanner>
      )}

      <TooltipWrapper>
        <Tooltip />
      </TooltipWrapper>

      <Title>Number Recognizer</Title>
      {user && user.displayName && (
        <Greeting>Hello, {user.displayName}! ✨</Greeting>
      )}
      <Subtitle>Upload an image with handwritten numbers</Subtitle>

      {!preview ? (
        <UploadBox
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={isDragging ? { borderColor: '#666', background: '#f0ede5' } : {}}
        >
          <CloudUploadIcon />
          <p>Drag and drop your image</p>
          <p>or</p>
          <BrowseButton>Browse files</BrowseButton>
          <input type="file" accept="image/jpeg,image/png" onChange={handleFileChange} />
        </UploadBox>
      ) : (
        <PreviewBox>
          <PreviewImage src={preview} alt="Preview" />
          {!isLoading && <RemoveButton onClick={clearImage}><CloseIcon /></RemoveButton>}
        </PreviewBox>
      )}

      {preview && !isLoading && !result && (
        <RecognizeButton onClick={handleRecognize}>Recognize ⋆✴︎˚｡⋆</RecognizeButton>
      )}

      {isLoading && <Loader />}

      {error && <ErrorText> error⁴⁰⁴ :  {error}</ErrorText>}

      {result && (
        <ResultBox>
          <ResultLabel>The number is...</ResultLabel>
          <ResultNumber>
            {result}
            <CheckBadge>
              <svg viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </CheckBadge>
          </ResultNumber>
          {user && user.emailVerified && !saved && (
            <SaveButton onClick={handleSave} disabled={saving}>
              <SaveIcon />
              {saving ? 'Saving...' : 'Save to History'}
            </SaveButton>
          )}
          {user && !user.emailVerified && !saved && (
            <SaveButton disabled style={{ opacity: 0.6 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Verify email to save
            </SaveButton>
          )}
          {saved && (
            <SaveButton disabled style={{ background: '#d1fca0' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Saved!
            </SaveButton>
          )}
        </ResultBox>
      )}

      {showAuthModal && (
        <Modal onClick={closeAuthModal}>
          <AuthModal onClick={(e) => e.stopPropagation()}>
            <ModalCloseButton onClick={closeAuthModal}>
              <CloseIcon />
            </ModalCloseButton>
            <h2>{isResetPassword ? 'Reset Password' : (isSignUp ? 'Sign Up' : 'Sign In')}</h2>
            <form onSubmit={handleAuth}>
              <AuthInput
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {!isResetPassword && (
                <AuthInput
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              )}
              {!isSignUp && !isResetPassword && (
                <ForgotPassword onClick={() => { setIsResetPassword(true); setAuthError(''); setAuthSuccess(''); }}>
                  Forgot password?
                </ForgotPassword>
              )}
              {authSuccess && <SuccessText>{authSuccess}</SuccessText>}
              {authError && <ErrorText style={{ marginTop: 0, marginBottom: 12 }}>{authError}</ErrorText>}
              <AuthSubmitButton type="submit" disabled={authLoading}>
                {authLoading ? 'Loading...' : (isResetPassword ? 'Send Reset Email' : (isSignUp ? 'Sign Up' : 'Sign In'))}
              </AuthSubmitButton>
            </form>
            {!isResetPassword && (
              <>
                <GoogleButton onClick={handleGoogleSignIn} disabled={authLoading}>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </GoogleButton>
                <AuthToggle>
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                  <span onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); setAuthSuccess(''); }}>
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </span>
                </AuthToggle>
              </>
            )}
            {isResetPassword && (
              <AuthToggle>
                <span onClick={() => { setIsResetPassword(false); setAuthError(''); setAuthSuccess(''); }}>
                  ← Back to Sign In
                </span>
              </AuthToggle>
            )}
          </AuthModal>
        </Modal>
      )}

      {showProfileModal && (
        <Modal onClick={closeProfileModal}>
          <ProfileModal onClick={(e) => e.stopPropagation()}>
            <ModalCloseButton onClick={closeProfileModal}>
              <CloseIcon />
            </ModalCloseButton>
            <h2>Profile</h2>
            
            <ProfileSection>
              <label>Email</label>
              <ProfileEmail>{user?.email}</ProfileEmail>
            </ProfileSection>

            <ProfileSection>
              <label>Display Name</label>
              <AuthInput
                type="text"
                placeholder="Enter your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{ marginBottom: 0 }}
              />
            </ProfileSection>

            {profileMessage.text && (
              <p style={{ 
                fontFamily: "'Literata', serif",
                fontSize: '14px',
                color: profileMessage.type === 'success' ? '#22c55e' : '#e53935',
                textAlign: 'center',
                marginBottom: '12px'
              }}>
                {profileMessage.text}
              </p>
            )}

            <ProfileButton onClick={handleUpdateName} disabled={savingName}>
              {savingName ? 'Saving...' : 'Save Name'}
            </ProfileButton>

            <ProfileButton $secondary onClick={handleProfileResetPassword} disabled={resettingPassword}>
              {resettingPassword ? 'Sending...' : 'Reset Password'}
            </ProfileButton>
          </ProfileModal>
        </Modal>
      )}

      <HistoryOverlay $isOpen={showHistory} onClick={() => setShowHistory(false)} />
      <HistoryPanel $isOpen={showHistory}>
        <h2>
          History
          <RemoveButton onClick={() => setShowHistory(false)} style={{ position: 'static', width: 28, height: 28 }}><CloseIcon /></RemoveButton>
        </h2>
        {historyLoading ? (
          <Loader />
        ) : historyError ? (
          <ErrorText style={{ marginTop: 0 }}>{historyError}</ErrorText>
        ) : history.length === 0 ? (
          <EmptyHistory>No saved images yet</EmptyHistory>
        ) : (
          history.map((item, index) => {
            const date = item.timestamp ? new Date(item.timestamp) : new Date();
            const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const title = `Recognition ${history.length - index}`;
            
            return (
              <HistoryItem key={item.id} onClick={() => loadHistoryItem(item)}>
                <img src={item.imageUrl} alt="Recognized" />
                <div className="details">
                  <div className="title">{title}</div>
                  <div className="date">
                    {item.timestamp ? new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'} · {timeStr}
                  </div>
                </div>
              </HistoryItem>
            );
          })
        )}
      </HistoryPanel>
    </Container>
  );
}

export default App;
