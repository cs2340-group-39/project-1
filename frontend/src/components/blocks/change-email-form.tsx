import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { useToast } from "../hooks/use-toast";

interface EmailObject {
  address: string;
  verified: boolean;
  primary: boolean;
}

interface AssociatedEmailsProps {
  emails: EmailObject[];
  selectedEmail: string | null;
  onSelectEmail: (address: string) => void;
}

const AssociatedEmails: React.FC<AssociatedEmailsProps> = ({
  emails,
  selectedEmail,
  onSelectEmail,
}) => {
  const [height, setHeight] = useState<number>(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const newHeight = ref.current.scrollHeight;
      setHeight(newHeight);
    }
  }, [emails]);

  return (
    <div
      className="transition-all duration-300 ease-in-out"
      style={{ height: height }}
    >
      <div
        ref={ref}
        className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 my-4"
      >
        {emails.length > 0 ? (
          emails.map((email, index) => (
            <div
              key={index}
              className={cn(
                "text-zinc-600 dark:text-zinc-400 mb-4 last:mb-0 flex flex-col p-2 rounded cursor-pointer",
                selectedEmail === email.address &&
                  "bg-blue-100 dark:bg-blue-900"
              )}
              onClick={() => onSelectEmail(email.address)}
            >
              <p className="font-medium">{email.address}</p>
              <div className="flex space-x-2 text-sm mt-1">
                <span
                  className={cn(
                    "px-2 py-1 rounded",
                    email.verified
                      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                      : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                  )}
                >
                  {email.verified ? "Verified" : "Not Verified"}
                </span>
                <span
                  className={cn(
                    "px-2 py-1 rounded",
                    email.primary
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                  )}
                >
                  {email.primary ? "Primary" : "Secondary"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-amber-600 dark:text-amber-400 mb-4 last:mb-0 flex flex-col">
            <p className="font-medium">
              Warning: You currently do not have any email address set up. You
              should really add an email address so you can receive
              notifications, reset your password, etc.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export function ChangeEmailForm() {
  const [associatedEmails, setAssociatedEmails] = useState<EmailObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAssociatedEmails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "http://127.0.0.1:8000/_allauth/browser/v1/account/email" // TODO: Change this, don't hardcode the domain
        );

        console.log(response.data.data);

        const newAssociatedEmails = response.data.data.map(
          (email: any): EmailObject => ({
            address: email.email,
            verified: email.verified,
            primary: email.primary,
          })
        );
        setAssociatedEmails(newAssociatedEmails);
      } catch (error: any) {
        console.error("Failed to fetch associated emails:", error);
        setError("Failed to load associated emails. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssociatedEmails();
  }, []); // Empty dependency array means this effect runs once on mount

  const handleDeleteEmail = async () => {
    if (selectedEmail) {
      // TODO: Implement API call to delete the selected email

      try {
        setIsLoading(true);

        const payload = {
          email: selectedEmail,
        };

        const response = await axios.delete(
          "http://127.0.0.1:8000/_allauth/browser/v1/account/email", // TODO: Change this, don't hardcode the domain
          {
            data: payload,
          }
        );

        // TODO: send push notifcation about email deletion
        toast({
          title: "Email deletion success",
          description: `Your associated email ${selectedEmail} has been deleted.`,
        });
        response;
      } catch (error: any) {
        console.error("Failed to fetch associated emails:", error);
        setError("Failed to load associated emails. Please try again later.");
      } finally {
        setIsLoading(false);
      }

      // After successful deletion, update the associatedEmails state
      setAssociatedEmails((prevEmails) =>
        prevEmails.filter((email) => email.address !== selectedEmail)
      );
      setSelectedEmail(null);
    }
  };

  return (
    <div className="max-w-md w-full rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black overflow-auto max-h-[75vh] z-10 relative">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        Change your Email Address
      </h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        The following email addresses are associated with your account:
      </p>
      <div className="mb-8">
        {isLoading ? (
          <p>Loading associated emails...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <AssociatedEmails
            emails={associatedEmails}
            selectedEmail={selectedEmail}
            onSelectEmail={setSelectedEmail}
          />
        )}
      </div>
      <button
        className={cn(
          "w-full px-4 py-2 rounded font-medium",
          selectedEmail
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        )}
        onClick={handleDeleteEmail}
        disabled={!selectedEmail}
      >
        Delete Selected Email
      </button>
    </div>
  );
}

// @ts-ignore
const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

// @ts-ignore
const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
