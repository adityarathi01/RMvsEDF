import math
import matplotlib.pyplot as plt
import numpy as np

def f(t,y):
  return y-t**2+1
  

a=0
b=2
h=0.025
n=int((b-a)/h)
t=np.linspace(a,b,n+1)
y0=0.5

def euler_method(a,b,n,t,y0):
  y=np.zeros(n+1)
  y[0]=y0
  for i in range(n):
    y[i+1]=y[i]+h*f(t[i],y[i])
  return y


def euler_modified(a,b,n,t,y0):
  y=np.zeros(n+1)
  y[0]=y0
  for i in range(n):
    y[i+1]=y[i]+h*(f(t[i],y[i])+f(t[i+1],y[i]+h*f(t[i],y[i])))/2
  return y


def rk4(a, b, n, t, y0):
  y = np.zeros(n + 1)
  y[0] = y0
  
  for i in range(n):
    k1 = h * f(t[i], y[i])
    k2 = h * f(t[i] + h / 2, y[i] + k1 / 2)
    k3 = h * f(t[i] + h / 2, y[i] + k2 / 2)
    k4 = h * f(t[i] + h, y[i] + k3)

    k = (k1 + 2 * k2 + 2 * k3 + k4) / 6

    y[i + 1] = y[i] + k  

  return y
 
print("euler method")
print("                     ")

result1=euler_method(a,b,n,t,y0)
for i in range (len(t)):
  print(f"t={t[i]:.2f}   y={result1[i]:.4f}")
print("                     ")
print("Modified euler method")
print("                     ")

result2=euler_modified(a,b,n,t,y0)
for i in range (len(t)):
  print(f"t={t[i]:.2f}   y={result2[i]:.4f}")
print("                     ")
print("runge kutta method")
print("                     ")

result3 = rk4(a, b, n, t, y0)
for i in range (len(t)):
  print(f"t={t[i]:.2f}   y={result3[i]:.4f}")


plt.plot(t,result1)
plt.plot(t,result2)
plt.plot(t,result3)
plt.show()