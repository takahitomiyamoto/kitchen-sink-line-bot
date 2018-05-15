# Awesome Retail Advisor
次の出店計画を立てている担当者にオススメのアプリ。

街の衛星写真から家の戸数を判定し、損益分岐点を超えるどうかの判断を助けてくれちゃいます。

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
次のQRコードを読み取り、LINE Botを友だち追加して話しかけます。

![Awesome Retail Adv.](https://github.com/takahitomiyamoto/kitchen-sink-line-bot/blob/master/uploaded/QR.png "Awesome Retail Adv.")

## 価値

## 現状の課題（2018/05/15時点）
- 画像をHerokuアプリのディレクトリ内に置いてSalesforceから参照しているが、Dynoを再起動するたびに画像は消失するため、時間が経つとSalesforceから参照できなくなる。
    - 永続的に画像を利用できるように、Heroku上のDBに格納するか、Salesforceのストレージに保存するかなどを検討する。
