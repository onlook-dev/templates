'use client';

export default function Page() {
    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-white transition-colors duration-200 flex-col p-4 gap-4">
            <div className="text-center text-gray-900 p-4">
                <h1 className="text-4xl font-semibold mb-4 tracking-tight">
                    Welcome to your app
                </h1>
                <p className="text-xl text-gray-800">
                    This is a blank Onlook app with Next.js and TailwindCSS
                </p>
            </div>
        </div>
    );
}
