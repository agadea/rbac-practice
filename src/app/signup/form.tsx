"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { SignUpFormSchema } from "@/lib/definitions";
import { signUpAction } from "./actions";
import { useFormStatus } from "react-dom";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { error } from "console";

const initialState = {
  message: "",
  type: "",
  errors: undefined,
};

export function SignUpForm() {
  const [state, formAction] = useActionState(signUpAction, initialState);
  const { pending } = useFormStatus();

  // 1. Define your form.
  const form = useForm<z.infer<typeof SignUpFormSchema>>({
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (state?.type === "error") {
      toast.error("Error", {
        description: state.message,
        action: {
          label: "Close",
          onClick: () => toast.dismiss(),
        },
      });
    }
  }, [state]);

  return (
    <Form {...form}>
      <form
        action={formAction}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormMessage>
                {state?.errors?.firstName && state.errors.firstName[0]}
              </FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormMessage>
                {state?.errors?.lastName && state.errors.lastName[0]}
              </FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="johndoe@example.com" {...field} />
              </FormControl>
              <FormMessage>
                {state?.errors?.email && state.errors.email[0]}
              </FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="******" {...field} />
              </FormControl>
              <FormMessage>
                {state?.errors?.password && state.errors.password[0]}
              </FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="******" {...field} />
              </FormControl>
              <FormMessage>
                {state?.errors?.confirmPassword &&
                  state.errors.confirmPassword[0]}
              </FormMessage>
            </FormItem>
          )}
        />

        <Button className="text-center col-span-2" disabled={pending}>
          Register
        </Button>
      </form>
    </Form>
  );
}
