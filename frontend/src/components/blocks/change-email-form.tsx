import axios from "axios";
import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { useToast } from "../hooks/use-toast";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const ALLAUTH_API_URL = "http://127.0.0.1:8000/_allauth/browser/v1/account/email";

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
    <div className="transition-all duration-300 ease-in-out" style={{ height: height }}>
      <div ref={ref} className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 my-4">
        {emails.length > 0 ? (
          emails.map((email, index) => (
            <div
              key={index}
              className={cn(
                "text-zinc-600 dark:text-zinc-400 mb-4 last:mb-0 flex flex-col p-2 rounded cursor-pointer",
                selectedEmail === email.address &&
                  "p-4 border-2 animate-shimmer rounded-md bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-zinc-400 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-50"
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
              Warning: You currently do not have any email address set up. You should really add an
              email address so you can receive notifications, reset your password, etc.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface AnimatedErrorProps {
  error: string | null;
}

const AnimatedError: React.FC<AnimatedErrorProps> = ({ error }) => {
  const [height, setHeight] = useState<number>(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const newHeight = error ? ref.current.scrollHeight : 0;
      setHeight(newHeight);
    }
  }, [error]);

  return (
    <div className="transition-all duration-300 ease-in-out" style={{ height: height }}>
      {error && (
        <div ref={ref} className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 my-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
};

export function ChangeEmailForm() {
  const [associatedEmails, setAssociatedEmails] = useState<EmailObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [inputs, setInputs] = useState({
    email: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchAssociatedEmails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(ALLAUTH_API_URL);

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
    setError(null);

    if (selectedEmail) {
      try {
        setIsLoading(true);

        const payload = {
          email: selectedEmail,
        };

        const response = await axios.delete(ALLAUTH_API_URL, {
          data: payload,
        });

        toast({
          title: "Email deletion success",
          description: `Your associated email ${selectedEmail} has been deleted.`,
        });
        response;

        // After successful deletion, update the associatedEmails state
        setAssociatedEmails((prevEmails) =>
          prevEmails.filter((email) => email.address !== selectedEmail)
        );
      } catch (error: any) {
        if (error.response.status === 400) {
          setError("Error: you cannot delete your primary email.");
        } else {
          setError("Error: Failed to load associated emails. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }

      setSelectedEmail(null);
    }
  };

  const handleMakePrimaryEmail = async () => {
    setError(null);

    if (selectedEmail) {
      try {
        setIsLoading(true);

        const payload = {
          email: selectedEmail,
          primary: true,
        };

        const response = await axios.patch(ALLAUTH_API_URL, payload);

        try {
          setIsLoading(true);
          const response = await axios.get(ALLAUTH_API_URL);

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
          if (error.response.status === 500) {
            setError(
              "There seems to be a problem on our end. Please try again later. Thank you for your patience."
            );
          } else {
            setError("Error: A problem occured. Please try again later.");
          }
        } finally {
          setIsLoading(false);
        }

        toast({
          title: "Email priority change success",
          description: `Your associated email ${selectedEmail} has been been made the primary address.`,
        });
        response;
      } catch (error: any) {
        console.error("Failed to fetch associated emails:", error);
        setError("Failed to load associated emails. Please try again later.");
      } finally {
        setIsLoading(false);
      }

      setSelectedEmail(null);
    }
  };

  const handleRequestVerificationEmail = async () => {
    setError(null);

    if (selectedEmail) {
      try {
        setIsLoading(true);

        const payload = {
          email: selectedEmail,
        };

        const response = await axios.put(ALLAUTH_API_URL, payload);

        toast({
          title: "Email verification success",
          description: `A verification email should have been sent to your email associated email address ${selectedEmail}. If you did not recieve an email, try again later.`,
        });
        response;
      } catch (error: any) {
        console.error("Failed to fetch associated emails:", error);
        if (error.response.status === 500) {
          setError(
            "Error: There seems to be a problem on our end. Please try again later. Thank you for your patience."
          );
        } else if (error.response.status === 403) {
          setError(
            "Error: It seems that too many verification requests have been sent. Please try again later."
          );
        } else {
          setError("Error: A problem occured. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }

      setSelectedEmail(null);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isValid = event.currentTarget.checkValidity();
    if (!isValid) {
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        email: inputs.email,
      };

      const response = await axios.post(ALLAUTH_API_URL, payload);

      toast({
        title: "Email successfully added",
        description: `The email ${inputs.email} should now be associated with your account.`,
      });

      if (inputs.email !== null) {
        setAssociatedEmails([...associatedEmails, inputs.email]);
      }
      response;
    } catch (error: any) {
      console.log(error);
      if (error.response.status === 500) {
        setError(
          "Error: There seems to be a problem on our end. Your email may have been added. To confirm, refresh the page. If it has not been added, please try again later. Thank you for your patience."
        );
      }
    } finally {
      setIsLoading(false);
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
        ) : (
          <>
            <AnimatedError error={error} />
            <AssociatedEmails
              emails={associatedEmails}
              selectedEmail={selectedEmail}
              onSelectEmail={setSelectedEmail}
            />
          </>
        )}
      </div>
      <div className="flex flex-col space-y-8">
        <button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          onClick={handleRequestVerificationEmail}
          disabled={!selectedEmail}
        >
          Request Verification Email
          {selectedEmail ? <BottomGradient /> : null}
        </button>
        <button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          onClick={handleMakePrimaryEmail}
          disabled={!selectedEmail}
        >
          Make Primary Email
          {selectedEmail ? <BottomGradient /> : null}
        </button>
        <button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          onClick={handleDeleteEmail}
          disabled={!selectedEmail}
        >
          Delete Selected Email
          {selectedEmail ? <BottomGradient /> : null}
        </button>
      </div>

      <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        Add an Email Address
      </h2>

      <form className="my-8" onSubmit={handleSubmit}>
        <LabelInputContainer className="mb-8">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            placeholder="johndoe@gatech.edu"
            type="email"
            onChange={handleChange}
            required={true}
          />
        </LabelInputContainer>

        <div className="mb-8">
          <button
            className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
            type="submit"
          >
            Add Email &rarr;
            <BottomGradient />
          </button>
        </div>
      </form>
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
  return <div className={cn("flex flex-col space-y-2 w-full", className)}>{children}</div>;
};
