"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Smartphone } from "lucide-react";

const PaymentMethods = ({ selectedMethod, onMethodChange, className = "" }) => {
  const paymentMethods = [
    {
      id: "razorpay",
      name: "Razorpay",
      description: "Pay with UPI, Cards, NetBanking, and Wallets",
      icon: <Smartphone className="h-5 w-5" />,
      popular: true,
      supportedMethods: ["UPI", "Cards", "NetBanking", "Wallets"]
    }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
        <CardDescription>Choose your preferred payment method</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedMethod}
          onValueChange={onMethodChange}
          className="space-y-3"
        >
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-start space-x-3">
              <RadioGroupItem 
                value={method.id} 
                id={method.id}
                className="mt-1"
              />
              <div className="flex-1">
                <Label
                  htmlFor={method.id}
                  className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {method.icon}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{method.name}</span>
                        {method.popular && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {method.description}
                      </p>
                      {method.supportedMethods.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {method.supportedMethods.map((supported) => (
                            <span
                              key={supported}
                              className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
                            >
                              {supported}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Label>
              </div>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default PaymentMethods;
