# Awesome Retail Advisor
次の出店計画を立てている担当者にオススメのアプリ。

街の衛星写真から家の戸数を判定し、損益分岐点を超えるどうかの判断を助けてくれちゃいます。

## デモ動画
[![Awesome Retail Advisor](http://img.youtube.com/vi/j8yGRI1-g_I/0.jpg)](https://www.youtube.com/watch?v=j8yGRI1-g_I)


## ストーリー
Astroさんは業界大手のスーパーマーケット「Codey」の新規事業責任者に就任しました。

Astroさんは比較的好調な都心での既存事業は部下に任せ、昔からやりたいと考えていた地方での新規事業、たとえば「過疎地への移動スーパー」で収益事業をつくれないかと考えはじめました。

Astroさんは自分のスマホから、最近友だちになったLINE Bot「Awesome Retail Advisor」に尋ねました。

「この場所ってどう？」

するとLINE Botから気になっているその場所の画像を送るように言われたので、Astroさんはその画像を送りました。

少し待っていると、LINE Botが分析結果を教えてくれました。

「家が60軒見つかりましたよ♫ 有望そうな場所ですね」

Astroさんは他にも気になっている場所があったので、続けて画像を送りました。

「家が5軒見つかりましたよ♫ ちょっと少ないかもですね」

「残念ながら家が見つかりません...」

これくらいで十分かなと思ったAstroさんは、LINE Botとの会話をやめ、社内システムであるSalesforceの画面を開きました。

ホームにあるダッシュボードには、さきほどの分析結果がグラフで一覧できるようになっています。

Astroさんは上位の結果を一通り確認して、移動スーパー事業の計画に取り掛かりました。（おわり）


## 設計の概要説明
利用者はLINE Botに対してテキストまたはスタンプまたは画像を送ります。

LINE Botは以下のAPIを利用しながら利用者と会話します：
- LINE Messaging API
- Google Cloud Translation API
- Einstein Platform Services

利用者からテキストが送られた場合、LINE Botは次のように処理をして回答します：
1. テキストを英語に翻訳する
1. 翻訳結果をEinstein Sentimentで感情分析する
1. 分析された感情（Positive, Negative, Neutral）に対応するスタンプを決定する
1. スタンプを添えた定型文で回答する

利用者からスタンプが送られた場合、LINE Botは次のように処理をして回答します：
1. Einstein Sentimentでの感情分析はスキップする
1. Neutralな感情に対応するスタンプを添えた定型文で回答する

利用者から画像が送られた場合、LINE Botは次のように処理をして回答します：
1. 送られた画像をダウンロードする
1. Einstein Platform Servicesのアクセストークンを取得する
1. Einstein Object Detectionで画像内の「家」を識別する
1. 識別結果の件数を「家の戸数」とみなす
1. 戸数に応じたメッセージ文とスタンプを決定する
1. スタンプを添えたメッセージ文で回答する
1. 会話の裏で次のAPIを利用して画像に関する情報（家の戸数、画像のURL）をSalesforceへ連携する

  - Lightning Platform REST API (nforce)

Salesforceへ連携された情報はカスタムオブジェクトのレコードとして保存されます。
![Records](https://github.com/takahitomiyamoto/kitchen-sink-line-bot/blob/master/uploaded/records.png "Records")

保存された情報はダッシュボードから情報を俯瞰できるので、利用者の判断をサポートすることができます。
![Dashboard](https://github.com/takahitomiyamoto/kitchen-sink-line-bot/blob/master/uploaded/dashboard.png "Dashboard")


## 使用テクノロジ
- Lightning Platform
- Heroku
  - Node.js
- Einstein Vision
  - Einstein Object Detection
- Einstein Language
  - Einstein Sentiment
- LINE Messaging API
- Google Cloud Translation API


## 使用方法

### LINE Bot
次のQRコードを読み取り、LINE Botを友だちに追加します。何か話しかけると会話が始まります。

具体的な会話のやり取りはデモ動画でご確認いただけます。

![Awesome Retail Adv.](https://github.com/takahitomiyamoto/kitchen-sink-line-bot/blob/master/uploaded/QR.png "Awesome Retail Adv.")

### Salesforce アプリケーション
次の資源をデプロイしてご利用ください。
- [src_salesforce](https://github.com/takahitomiyamoto/kitchen-sink-line-bot/tree/master/examples/awesome-retail-advisor/src_salesforce)

## 価値
1. 自動で家を識別してくれるので、人手を借りずに多くの画像を一括処理できる
1. Googleアースなどの地図アプリを利用して画像データを入手すればよいため、わざわざ出張しなくてもよくなる
1. 普段使い慣れているアプリだけで完結するため、あまりITに詳しくない利用者でも簡単に活用していける
1. 利用者の感情に応じてLINE Botの回答に添えるスタンプに変化を持たせることで楽しい会話を演出している
1. 識別する対象を変更することで業界を問わず広く応用できる可能性を持っている

## 開発に至った経緯
当アプリコンテストに参加するにあたり、小売業界の某企業に勤めている幼馴染みのIさん（人材開発マネージャー）と、
どんなAIアプリがあれば実務で役に立ちそうかのアイデアソンをしました。

いろいろとブレストする中で、彼の会社では新規事業として過疎地での移動スーパー事業の話が持ち上がっており、
収益化のポイントを見極めるためには単位圏内あたりの世帯数が損益分岐点の1つとして重要かもしれない、という話に興味を持ちました。

彼は地元にいるため、このアイデアソン自体をLINEで実施していたのですが、
いまやっているようなイメージでAIが答えてくれたらおもしろいんじゃないか、
あまりITに詳しくない彼でも簡単に使い始められるのではないか、
そんなことをふと考えました。

実際に商用化するに当たっては、精緻な予測モデルが要求されるなどハードルがありますが、
まずはハッカソンとして作ってみてアイデアの実現可能性を見極めるのもいいかもしれないと思い、開発に着手しました。


## 実装上の課題（2018/05/15時点）
- Herokuアプリ内にダウンロードされている画像をSalesforceから参照しているが、Dynoを再起動するたびに画像は消失し、Salesforceから参照できなくなる。

  &rarr; 永続的に画像を参照できるように設計する必要がある。Heroku上のDBに格納する、Salesforceのストレージに保存する、などを検討する。

- Salesforceの画面に画像のURLが表示されているが、具体的な住所がわからないため、非常に有望な場所であったとしてもすぐに行動にうつすことができない。

  &rarr; 画像データと住所を紐づけて管理できるようにする必要がある。画像データ取得時に位置情報や住所などを合わせて取得できる方法を検討する。
