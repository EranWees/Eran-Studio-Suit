import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { LucideLogIn } from 'lucide-react';

interface LoginProps {
    onLoginSuccess: (accessToken: string) => void;
    onLoginFailure: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onLoginFailure }) => {
    const login = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            console.log("Login Success:", tokenResponse);
            onLoginSuccess(tokenResponse.access_token);
        },
        onError: () => {
            console.error("Login Failed");
            onLoginFailure();
        },
        scope: 'https://www.googleapis.com/auth/generative-language.retriever',
    });

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-white relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="z-10 flex flex-col items-center space-y-8 p-8 bg-surface/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl max-w-md w-full mx-4">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Eran Studio</h1>
                    <p className="text-gray-400">AI-Powered Creative Suite</p>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                <button
                    onClick={() => login()}
                    className="group relative flex items-center justify-center space-x-3 w-full py-4 px-6 bg-white text-black rounded-xl font-medium hover:bg-gray-100 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                    <span>Sign in with Google</span>
                    <div className="absolute inset-0 rounded-xl ring-2 ring-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>

                <p className="text-xs text-gray-500 text-center max-w-xs">
                    By signing in, you allow Eran Studio to access the Gemini API using your account.
                </p>
            </div>
        </div>
    );
};
