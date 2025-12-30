/**
 * 서울비디치과 Firebase 인증 시스템
 * Firebase Auth + Firestore 연동
 * v1.1.0 (2024-12-06) - 프로덕션 최적화
 */

// 프로덕션 환경 감지 (콘솔 로그 비활성화)
const IS_PRODUCTION = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
const log = IS_PRODUCTION ? () => {} : console.log.bind(console);
const logError = IS_PRODUCTION ? () => {} : console.error.bind(console);
const logWarn = IS_PRODUCTION ? () => {} : console.warn.bind(console);

// Firebase 구성 정보
const firebaseConfig = {
  apiKey: "AIzaSyAEf76WE8VmVAD5RSlC9_rUh4bGO4OTHc4",
  authDomain: "seoulbd-2c642.firebaseapp.com",
  projectId: "seoulbd-2c642",
  storageBucket: "seoulbd-2c642.firebasestorage.app",
  messagingSenderId: "477046265380",
  appId: "1:477046265380:web:46c13a2b3010f2e271eab1",
  measurementId: "G-M33H1J65BV"
};

// Firebase 초기화 (CDN 방식)
let app, auth, db;

// Firebase SDK 로드 확인 후 초기화
function initializeFirebase() {
  if (typeof firebase !== 'undefined') {
    // Firebase 앱 초기화
    if (!firebase.apps.length) {
      app = firebase.initializeApp(firebaseConfig);
    } else {
      app = firebase.app();
    }
    
    auth = firebase.auth();
    db = firebase.firestore();
    
    // 한국어 설정
    auth.languageCode = 'ko';
    
    log('✅ Firebase 초기화 완료');
    
    // 인증 상태 변경 감지
    auth.onAuthStateChanged(handleAuthStateChanged);
    
    return true;
  }
  return false;
}

// ■ 인증 상태 변경 핸들러
function handleAuthStateChanged(user) {
  const event = new CustomEvent('authStateChanged', { detail: { user } });
  window.dispatchEvent(event);
  
  if (user) {
    log('👤 로그인 상태:', user.email);
    updateUIForLoggedInUser(user);
  } else {
    log('👤 로그아웃 상태');
    updateUIForLoggedOutUser();
  }
}

// ■ 이메일 회원가입
async function registerWithEmail(email, password, userData) {
  try {
    showLoading(true);
    
    // Firebase Auth 회원가입
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // 프로필 업데이트 (이름)
    if (userData.name) {
      await user.updateProfile({
        displayName: userData.name
      });
    }
    
    // Firestore에 회원 정보 저장
    await saveUserToFirestore(user.uid, {
      email: user.email,
      name: userData.name || '',
      phone: userData.phone || '',
      birthdate: userData.birthdate || '',
      gender: userData.gender || '',
      agreedTerms: userData.agreedTerms || false,
      agreedPrivacy: userData.agreedPrivacy || false,
      agreedMarketing: userData.agreedMarketing || false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      provider: 'email',
      role: 'member'
    });
    
    // 이메일 인증 발송 (선택)
    // await user.sendEmailVerification();
    
    showLoading(false);
    return { success: true, user };
    
  } catch (error) {
    showLoading(false);
    logError('회원가입 에러:', error);
    return { success: false, error: getErrorMessage(error.code) };
  }
}

// ■ 이메일 로그인
async function loginWithEmail(email, password) {
  try {
    showLoading(true);
    
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // 마지막 로그인 시간 업데이트
    await updateLastLogin(user.uid);
    
    showLoading(false);
    return { success: true, user };
    
  } catch (error) {
    showLoading(false);
    logError('로그인 에러:', error);
    return { success: false, error: getErrorMessage(error.code) };
  }
}

// ■ Google 소셜 로그인
async function loginWithGoogle() {
  try {
    showLoading(true);
    
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    
    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    const isNewUser = result.additionalUserInfo?.isNewUser;
    
    // 신규 회원이면 Firestore에 저장
    if (isNewUser) {
      await saveUserToFirestore(user.uid, {
        email: user.email,
        name: user.displayName || '',
        phone: '',
        profileImage: user.photoURL || '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        provider: 'google',
        role: 'member'
      });
    } else {
      await updateLastLogin(user.uid);
    }
    
    showLoading(false);
    return { success: true, user, isNewUser };
    
  } catch (error) {
    showLoading(false);
    logError('Google 로그인 에러:', error);
    return { success: false, error: getErrorMessage(error.code) };
  }
}

// ■ 카카오 소셜 로그인 (Custom Token 방식 - Firebase Functions 필요)
// 카카오 SDK를 사용하여 로그인 후 Firebase Custom Token으로 인증
async function loginWithKakao() {
  try {
    showLoading(true);
    
    // 카카오 SDK 초기화 확인
    if (typeof Kakao === 'undefined') {
      throw new Error('카카오 SDK가 로드되지 않았습니다.');
    }
    
    // 카카오 로그인 실행
    return new Promise((resolve, reject) => {
      Kakao.Auth.login({
        success: async function(authObj) {
          try {
            // 카카오 사용자 정보 가져오기
            Kakao.API.request({
              url: '/v2/user/me',
              success: async function(kakaoUser) {
                const kakaoId = kakaoUser.id;
                const kakaoEmail = kakaoUser.kakao_account?.email || `kakao_${kakaoId}@seoulbd.kakao`;
                const kakaoName = kakaoUser.kakao_account?.profile?.nickname || '카카오 회원';
                const kakaoPhoto = kakaoUser.kakao_account?.profile?.profile_image_url || '';
                
                // Firebase에 카카오 사용자로 저장 (이메일/비밀번호 방식으로 대체)
                // 실제 운영시에는 Firebase Functions로 Custom Token 발급 필요
                const tempPassword = `kakao_${kakaoId}_${Date.now()}`;
                
                try {
                  // 기존 계정 로그인 시도
                  const loginResult = await auth.signInWithEmailAndPassword(kakaoEmail, tempPassword);
                  await updateLastLogin(loginResult.user.uid);
                  showLoading(false);
                  resolve({ success: true, user: loginResult.user, isNewUser: false });
                } catch (loginError) {
                  if (loginError.code === 'auth/user-not-found' || loginError.code === 'auth/invalid-credential') {
                    // 신규 회원 생성
                    try {
                      const createResult = await auth.createUserWithEmailAndPassword(kakaoEmail, tempPassword);
                      const user = createResult.user;
                      
                      await user.updateProfile({
                        displayName: kakaoName,
                        photoURL: kakaoPhoto
                      });
                      
                      await saveUserToFirestore(user.uid, {
                        email: kakaoEmail,
                        name: kakaoName,
                        phone: '',
                        profileImage: kakaoPhoto,
                        kakaoId: kakaoId,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                        provider: 'kakao',
                        role: 'member'
                      });
                      
                      showLoading(false);
                      resolve({ success: true, user: user, isNewUser: true });
                    } catch (createError) {
                      showLoading(false);
                      reject({ success: false, error: getErrorMessage(createError.code) });
                    }
                  } else {
                    showLoading(false);
                    reject({ success: false, error: getErrorMessage(loginError.code) });
                  }
                }
              },
              fail: function(error) {
                showLoading(false);
                reject({ success: false, error: '카카오 사용자 정보를 가져올 수 없습니다.' });
              }
            });
          } catch (error) {
            showLoading(false);
            reject({ success: false, error: error.message });
          }
        },
        fail: function(error) {
          showLoading(false);
          reject({ success: false, error: '카카오 로그인에 실패했습니다.' });
        }
      });
    });
    
  } catch (error) {
    showLoading(false);
    logError('카카오 로그인 에러:', error);
    return { success: false, error: error.message || '카카오 로그인에 실패했습니다.' };
  }
}

// ■ 로그아웃
async function logout() {
  try {
    // 카카오 로그아웃도 함께 처리
    if (typeof Kakao !== 'undefined' && Kakao.Auth.getAccessToken()) {
      Kakao.Auth.logout();
    }
    await auth.signOut();
    return { success: true };
  } catch (error) {
    logError('로그아웃 에러:', error);
    return { success: false, error: error.message };
  }
}

// ■ 비밀번호 재설정 이메일 발송
async function sendPasswordReset(email) {
  try {
    showLoading(true);
    await auth.sendPasswordResetEmail(email);
    showLoading(false);
    return { success: true };
  } catch (error) {
    showLoading(false);
    logError('비밀번호 재설정 에러:', error);
    return { success: false, error: getErrorMessage(error.code) };
  }
}

// ■ Firestore에 회원 정보 저장
async function saveUserToFirestore(uid, userData) {
  try {
    await db.collection('users').doc(uid).set(userData, { merge: true });
    log('✅ 회원 정보 저장 완료');
    return true;
  } catch (error) {
    logError('Firestore 저장 에러:', error);
    return false;
  }
}

// ■ Firestore에서 회원 정보 가져오기
async function getUserFromFirestore(uid) {
  try {
    const doc = await db.collection('users').doc(uid).get();
    if (doc.exists) {
      return { success: true, data: doc.data() };
    } else {
      return { success: false, error: '회원 정보를 찾을 수 없습니다.' };
    }
  } catch (error) {
    logError('Firestore 조회 에러:', error);
    return { success: false, error: error.message };
  }
}

// ■ 회원 정보 업데이트
async function updateUserProfile(uid, updateData) {
  try {
    showLoading(true);
    
    updateData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    await db.collection('users').doc(uid).update(updateData);
    
    // displayName 업데이트
    if (updateData.name && auth.currentUser) {
      await auth.currentUser.updateProfile({
        displayName: updateData.name
      });
    }
    
    showLoading(false);
    return { success: true };
  } catch (error) {
    showLoading(false);
    logError('프로필 업데이트 에러:', error);
    return { success: false, error: error.message };
  }
}

// ■ 마지막 로그인 시간 업데이트
async function updateLastLogin(uid) {
  try {
    await db.collection('users').doc(uid).update({
      lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    logError('로그인 시간 업데이트 에러:', error);
  }
}

// ■ 현재 로그인 사용자 가져오기
function getCurrentUser() {
  return auth ? auth.currentUser : null;
}

// ■ 로그인 여부 확인
function isLoggedIn() {
  return auth && auth.currentUser !== null;
}

// ■ 에러 메시지 한글 변환
function getErrorMessage(errorCode) {
  const errorMessages = {
    'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
    'auth/invalid-email': '올바른 이메일 형식이 아닙니다.',
    'auth/operation-not-allowed': '이메일/비밀번호 로그인이 비활성화되어 있습니다.',
    'auth/weak-password': '비밀번호는 6자 이상이어야 합니다.',
    'auth/user-disabled': '비활성화된 계정입니다.',
    'auth/user-not-found': '등록되지 않은 이메일입니다.',
    'auth/wrong-password': '비밀번호가 일치하지 않습니다.',
    'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
    'auth/too-many-requests': '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.',
    'auth/popup-closed-by-user': '로그인 팝업이 닫혔습니다.',
    'auth/cancelled-popup-request': '로그인이 취소되었습니다.',
    'auth/popup-blocked': '팝업이 차단되었습니다. 팝업 차단을 해제해주세요.',
    'auth/network-request-failed': '네트워크 연결을 확인해주세요.'
  };
  
  return errorMessages[errorCode] || '오류가 발생했습니다. 다시 시도해주세요.';
}

// ■ 로딩 표시
function showLoading(show) {
  const loader = document.getElementById('authLoader');
  if (loader) {
    loader.style.display = show ? 'flex' : 'none';
  }
}

// ■ 현재 페이지 깊이에 따른 경로 접두사 계산
function getAuthBasePath() {
  const path = window.location.pathname;
  // auth 폴더 내부인 경우
  if (path.includes('/auth/')) {
    return '';
  }
  // 하위 폴더 (treatments/, doctors/, cases/ 등)
  if (path.includes('/treatments/') || path.includes('/doctors/') || 
      path.includes('/cases/') || path.includes('/column/') || 
      path.includes('/bdx/') || path.includes('/faq/') || path.includes('/area/')) {
    return '../auth/';
  }
  // 루트 레벨
  return 'auth/';
}

// ■ UI 업데이트 - 로그인 상태
function updateUIForLoggedInUser(user) {
  const basePath = getAuthBasePath();
  const displayName = user.displayName || '마이페이지';
  
  // 다국어 지원을 위한 번역 텍스트 가져오기
  const t = window.SeoulBDLang ? window.SeoulBDLang.t : null;
  const mypageText = t ? t('auth.mypage') : '마이페이지';
  const logoutText = t ? t('auth.logout') : '로그아웃';
  
  // 헤더 로그인 버튼 → 마이페이지 버튼으로 변경
  const authButtons = document.querySelectorAll('.auth-buttons');
  authButtons.forEach(container => {
    container.innerHTML = `
      <a href="${basePath}mypage.html" class="btn-auth btn-mypage">
        <i class="fas fa-user-circle"></i>
        <span data-i18n="auth.mypage">${displayName || mypageText}</span>
      </a>
      <button onclick="window.firebaseAuth.logout().then(() => location.reload())" class="btn-auth btn-logout">
        <i class="fas fa-sign-out-alt"></i>
        <span data-i18n="auth.logout">${logoutText}</span>
      </button>
    `;
  });
  
  // 모바일 인증 버튼도 업데이트
  const mobileAuthButtons = document.querySelectorAll('.mobile-auth-buttons');
  mobileAuthButtons.forEach(container => {
    container.innerHTML = `
      <a href="${basePath}mypage.html" class="btn-auth btn-mypage">
        <i class="fas fa-user-circle"></i>
        <span data-i18n="auth.mypage">${displayName || mypageText}</span>
      </a>
      <button onclick="window.firebaseAuth.logout().then(() => location.reload())" class="btn-auth btn-logout">
        <i class="fas fa-sign-out-alt"></i>
        <span data-i18n="auth.logout">${logoutText}</span>
      </button>
    `;
  });
  
  // 로그인 필요 요소 표시
  document.querySelectorAll('.require-login').forEach(el => {
    el.style.display = 'block';
  });
  
  // 로그아웃 상태 요소 숨김
  document.querySelectorAll('.require-logout').forEach(el => {
    el.style.display = 'none';
  });
}

// ■ UI 업데이트 - 로그아웃 상태
function updateUIForLoggedOutUser() {
  const basePath = getAuthBasePath();
  
  // 다국어 지원을 위한 번역 텍스트 가져오기
  const t = window.SeoulBDLang ? window.SeoulBDLang.t : null;
  const loginText = t ? t('auth.login') : '로그인';
  const registerText = t ? t('auth.register') : '회원가입';
  
  // 헤더에 로그인/회원가입 버튼 표시
  const authButtons = document.querySelectorAll('.auth-buttons');
  authButtons.forEach(container => {
    container.innerHTML = `
      <a href="${basePath}login.html" class="btn-auth btn-login">
        <i class="fas fa-sign-in-alt"></i>
        <span data-i18n="auth.login">${loginText}</span>
      </a>
      <a href="${basePath}register.html" class="btn-auth btn-register">
        <i class="fas fa-user-plus"></i>
        <span data-i18n="auth.register">${registerText}</span>
      </a>
    `;
  });
  
  // 모바일 인증 버튼도 업데이트
  const mobileAuthButtons = document.querySelectorAll('.mobile-auth-buttons');
  mobileAuthButtons.forEach(container => {
    container.innerHTML = `
      <a href="${basePath}login.html" class="btn-auth btn-login">
        <i class="fas fa-sign-in-alt"></i>
        <span data-i18n="auth.login">${loginText}</span>
      </a>
      <a href="${basePath}register.html" class="btn-auth btn-register">
        <i class="fas fa-user-plus"></i>
        <span data-i18n="auth.register">${registerText}</span>
      </a>
    `;
  });
  
  // 로그인 필요 요소 숨김
  document.querySelectorAll('.require-login').forEach(el => {
    el.style.display = 'none';
  });
  
  // 로그아웃 상태 요소 표시
  document.querySelectorAll('.require-logout').forEach(el => {
    el.style.display = 'block';
  });
}

// ■ 이메일 유효성 검사
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// ■ 비밀번호 강도 검사
function validatePassword(password) {
  // 최소 8자, 영문+숫자+특수문자 조합
  const minLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    isValid: minLength && hasLetter && hasNumber,
    minLength,
    hasLetter,
    hasNumber,
    hasSpecial,
    strength: [minLength, hasLetter, hasNumber, hasSpecial].filter(Boolean).length
  };
}

// ■ 전화번호 포맷팅
function formatPhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  return phone;
}

// ■ 페이지 로드 시 Firebase 초기화
document.addEventListener('DOMContentLoaded', () => {
  // Firebase SDK가 로드될 때까지 대기
  const checkFirebase = setInterval(() => {
    if (initializeFirebase()) {
      clearInterval(checkFirebase);
    }
  }, 100);
  
  // 5초 후에도 로드 안되면 에러
  setTimeout(() => {
    clearInterval(checkFirebase);
    if (typeof firebase === 'undefined') {
      logError('❌ Firebase SDK 로드 실패');
    }
  }, 5000);
});

// 전역 함수로 내보내기
window.firebaseAuth = {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  loginWithKakao,
  logout,
  sendPasswordReset,
  getCurrentUser,
  isLoggedIn,
  getUserFromFirestore,
  updateUserProfile,
  validateEmail,
  validatePassword,
  formatPhoneNumber
};
