# 日本語
# 概要
このリポジトリには、Azure B2C カスタム ポリシーの XML 定義ファイルが含まれています。これらのファイルは、Fujitsu テナントおよびポリシー キーに基づいてカスタマイズされています。

# ポリシー定義
1. TrustFrameworkBase - スターター キット テンプレートに基づく基本ポリシー定義が含まれています。
2. TrustFrameworkExtensions - TrustFrameworkBase から削除され、サインイン、サインアップ フローを更新するためにこのファイルに追加された ClaimsProviders および User Journeys が含まれています。
3. SignUpOrSignin - サインインおよびサインアップの Relying Party が含まれています。
4. DeleteUser - ユーザーを削除するための定義が含まれています。
---
# English
# Introduction 
This repository contains the Azure B2C Custom Policy XML definition files. These files are customized based on Fujitsu tenant and policy keys. 

# Policy definitions
1. TrustFrameworkBase - Contains the base policy definitions based on starter kit templates.
2. TrustFrameworkExtensions - Contains the ClaimsProviders and User Journeys that are removed from TrustFrameworkBase and added to this file for updating sign-in, sign-up flows.
3. SignUpOrSignin - Contains the Relying Party for sign-in and sign-up.
4. DeleteUser - Contains the definitions for deleting user.
---