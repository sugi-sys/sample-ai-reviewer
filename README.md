#  AIによるJUnit練習アプリのサンプル
##  How to use
###  Groqを使用する場合
1.  [Groq](https://groq.com/)公式サイトにて、会員登録とAPIキーの取得を行なってください。（[利用規約](https://wow.groq.com/terms-of-use/)）
2.  環境変数`${SPRING_AI_OPENAI_API_KEY}`に取得したAPIキーをセットしてください。

##  補足
-  Groq以外のLLMサービスを利用したい場合は、[application.yml](./src/main/resources/application.yml)内にある`spring.ai.openai.base-url`を適宜変更してください。OpenAI互換のAPIであれば利用できます。
-  SpringSecurityは適宜設定を行なってください。開発用の機能として、環境変数`${SPRING_SECURITY_NAME}`にユーザー名、`${SPRING_SECURITY_PASSWORD}`にパスワードをセットするとアカウントを即席で利用できます。
-  ログアウトボタンなどは適宜実装をしてください。