#include<iostream>
#include<vector>
#include<string>
using namespace std;

vector<vector<int>> dp(1000,vector<int>(1000,0));

void lcs(string s, string t, int n, int m){
  // make dp table
  for(int i = 0 ;i<=n ; i++) dp[i][0] = 0;
  for(int j = 0 ;j<=m ; j++) dp[0][j] = 0;
  for(int i = 1 ; i<=n ;i++){
    for(int j = 1 ;j<=m; j++){
      if(s[i-1]==t[j-1]) dp[i][j]=1+dp[i-1][j-1];
      else dp[i][j]=0;
    }
  }

  // get the string out of dp table
  string res = "";
  string buff ="";
  int i = n, j = m;
  while(i>0 && j>0){
    if(s[i-1]==t[j-1]){
      res = s[i-1]+res;
      buff = (res.size()>buff.size()? res: buff);
      i--, j--;
    }
    else if(dp[i][j-1]>dp[i-1][j]){
      j--;
      res ="";
    }
    else{
      i--;res = "";
    };
  }
cout<<buff;
}

int main(){
  string s = "ABCBDAB" ,t = "BDCABA";
  int n = s.size(),  m = t.size();
  
  lcs(s,t,n,m);
  return 0;
}