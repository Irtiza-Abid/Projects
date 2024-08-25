#include<stdio.h>
void Balance(int balance);
int Transaction(int Amount);
int Funds(int balance);
int PIN(int c);
int main()
{
int pin=8643; int Amount=35000;
int PINN,choice=0; char choice2;
char User2[50]={}; 
Enter:
puts(">>>>>>>>>>>>>>Welcome to ATM<<<<<<<<<<<<<<");
puts("Please Enter your 4-digit pin: ");
scanf("%d",&PINN);
if(PINN==pin)
{
printf(">>>>>>>>>>>>>>MENU<<<<<<<<<<<<<<");
printf("\n");
puts("Press    1.Balance Inquiry\t2.Transaction\n\t3.Funds Transfer\t4.Change Pin\n");
scanf("%d",&choice);
switch(choice)
{
case 1:
Balance(Amount);
break;
case 2:
Transaction(Amount);
break;
case 3:
Funds(Amount);
break;
case 4:
PIN(pin);
}
}
else {
printf("XXXXxxxAccessDenied!xxxXXXX");
goto Enter;}
printf("Do you want to continue?(y/n): ");
scanf("%c",&choice2);
if(choice2=='y')
goto Enter;
else
printf("Thank you for visiting!");
return 0;
}
void Balance(int balance)
{
printf("Balance = %d\n",balance);
}
int Transaction(int balance)
{
int a=0;
printf("Amount = ");
scanf("%d",&a);
if(a>balance)
printf("Insufficient balance\n");
else
{
printf("Transaction Successful\n");
balance=balance-a;
return balance;
}
}
int Funds(int balance)
{
int b; char User2[50]={};
puts("Name of User to transfer fund: ");
gets(User2);
puts(User2);
printf("Amount to transfer = ");
scanf("%d",&b);
if(b>balance)
printf("Not possible\n");
else
{
printf("You have succesfully tranferred %d to",b);
puts(User2);
balance=balance-b;
return balance;
}
}
int PIN(int c)
{
int d,e;
printf("Enter your last pin code: ");
scanf("%d",&d);
if(d==c)
{
printf("Enter new pin code: ");
scanf("%d",&d);
e=d;
printf("Enter pin code again: ");
scanf("%d",&d);
if(d==e)
{
printf("Password changed");
c=d;
}
}
else 
printf("Try again");
return c;
} 