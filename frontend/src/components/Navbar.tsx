"use client"; // This directive makes this component a client component

import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import FileUploader from "./FileUploader";

const Navbar: React.FC = () => {
    const { userId } = useAuth();



    return (
        <div className="bg-cyan-950 rounded-b-xl">
            <ul className="flex justify-between py-4 px-6">
                <div>
                    <Link href="/" className="text-3xl font-bold">
                        Media Storage
                    </Link>
                </div>

                <div className="flex gap-6 items-center">
                    {!userId ? (
                        <>
                            <Link href="/sign-in">
                                <li>Login</li>
                            </Link>
                            <Link href="/sign-up">
                                <li>Sign Up</li>
                            </Link>
                        </>
                    ) : (
                        <>
                            <FileUploader />
                            <li className="flex items-center">
                                <UserButton />
                            </li>
                        </>
                    )}
                </div>
            </ul>
        </div>
    );
};

export default Navbar;
