/* ============================================
   KeiyakuMaker - Application Logic
   法的根拠に基づく契約書自動生成
   ============================================ */

(function() {
  'use strict';

  // --- Template Definitions ---
  var templates = {
    outsourcing: {
      title: '業務委託契約書',
      desc: 'フリーランスへの業務委託時に必要な契約書を作成します。民法第632条（請負）・第643条（委任）に基づきます。',
      free: true
    },
    nda: {
      title: '秘密保持契約書（NDA）',
      desc: '取引先との機密情報を保護するための契約書です。不正競争防止法の営業秘密保護を踏まえた内容です。',
      free: true
    },
    sales: {
      title: '売買契約書',
      desc: '商品・製品の売買取引に使用する契約書です。民法第555条（売買）に基づきます。',
      free: true
    },
    employment: {
      title: '雇用契約書',
      desc: '従業員の雇用条件を明記する契約書です。労働基準法第15条に基づく労働条件の明示義務に対応しています。',
      free: true
    },
    lease: {
      title: '賃貸借契約書',
      desc: '不動産やオフィスの賃貸借契約書です。借地借家法・民法第601条に基づきます。',
      free: true
    },
    partnership: {
      title: '業務提携契約書',
      desc: '企業間の業務提携に関する契約書です。独占禁止法に留意した内容で作成します。',
      free: true
    },
    terms: {
      title: '利用規約',
      desc: 'Webサービスやアプリの利用規約です。電子消費者契約法・特定商取引法に対応しています。',
      free: true
    },
    privacy: {
      title: 'プライバシーポリシー',
      desc: '個人情報保護法（2022年改正対応）に準拠したプライバシーポリシーを生成します。',
      free: true
    },
    license: {
      title: 'ソフトウェアライセンス契約書',
      desc: 'ソフトウェアの使用許諾に関する契約書です。著作権法に基づきます。',
      free: true
    },
    consulting: {
      title: '顧問契約書',
      desc: '弁護士・税理士・コンサルタント等への顧問契約書です。民法第643条（委任）に基づきます。',
      free: true
    }
  };

  // --- Utility Functions ---
  function formatDate(dateStr) {
    if (!dateStr) return '____年__月__日';
    var d = new Date(dateStr);
    return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日';
  }

  function formatMoney(str) {
    if (!str) return '金____円';
    var num = str.replace(/,/g, '');
    if (isNaN(num)) return '金' + str + '円';
    return '金' + Number(num).toLocaleString() + '円';
  }

  function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value : '';
  }

  function helpIcon(text) {
    return '<span class="help-icon">?<span class="help-tooltip">' + text + '</span></span>';
  }

  function lbl(label, required, helpText) {
    var html = '<label class="form-label">' + label;
    if (required) html += '<span class="required">*</span>';
    if (helpText) html += helpIcon(helpText);
    html += '</label>';
    return html;
  }

  function sectionTitle(icon, title) {
    return '<div class="form-section-title"><span class="section-icon">' + icon + '</span>' + title + '</div>';
  }

  function guide(text) {
    return '<div class="field-guide"><span class="field-guide-icon">&#128161;</span><span>' + text + '</span></div>';
  }

  var payMethodMap = { bank: '銀行振込', check: '小切手', cash: '現金', other: 'その他甲乙協議の上定める方法' };
  var payDeadlineMap = { '30': '納品月末締め翌月末払い', 'end': '納品月末払い', '15': '納品月末締め翌月15日払い' };

  function getPaymentMethodText(v) { return payMethodMap[v] || '銀行振込'; }
  function getPaymentDeadlineText(v) { return payDeadlineMap[v] || '納品月末締め翌月末払い'; }

  function getIpRightsText(v) {
    var m = {
      client: '本業務の遂行により生じた成果物に関する一切の知的財産権（著作権法第27条及び第28条に規定する権利を含む）は、対価の完済をもって甲に移転するものとする。乙は、甲に対して著作者人格権を行使しないものとする。',
      contractor: '本業務の遂行により生じた成果物に関する一切の知的財産権は、乙に帰属するものとする。甲に対しては、本契約の目的に必要な範囲で使用する非独占的な通常使用権が付与される。',
      shared: '本業務の遂行により生じた成果物に関する知的財産権は、甲及び乙の共有とする。共有持分は均等とし、各自の持分の行使について相手方の同意を要しないものとする。'
    };
    return m[v] || m.client;
  }

  function today() { return formatDate(new Date().toISOString().split('T')[0]); }

  function signBlock(partyA, partyAAddr, partyB, partyBAddr) {
    var h = '<p style="margin-top:40px;">本契約の成立を証するため、本書2通を作成し、甲乙記名押印の上、各1通を保有する。</p>';
    h += '<p style="margin-top:20px;">' + today() + '</p>';
    h += '<div style="display:flex;gap:60px;margin-top:30px;flex-wrap:wrap;">';
    h += '<div style="flex:1;min-width:200px;"><p>甲：' + partyA + '</p><p>住所：' + partyAAddr + '</p><p style="margin-top:40px;">　　　　　　　　　印</p></div>';
    h += '<div style="flex:1;min-width:200px;"><p>乙：' + partyB + '</p><p>住所：' + partyBAddr + '</p><p style="margin-top:40px;">　　　　　　　　　印</p></div>';
    h += '</div>';
    return h;
  }

  // 反社会的勢力排除条項（全契約共通）
  function antiSocialClause(n) {
    var h = '<p><strong>第' + n + '条（反社会的勢力の排除）</strong></p>';
    h += '<p>1. 甲及び乙は、自己又はその役員、実質的に経営を支配する者が、暴力団、暴力団員、暴力団関係企業、総会屋その他の反社会的勢力（以下「反社会的勢力」という）に該当しないことを表明し、保証する。</p>';
    h += '<p>2. 甲又は乙は、相手方が前項に違反した場合、何らの催告なく直ちに本契約を解除することができる。</p>';
    return h;
  }

  // --- Form Templates ---
  var formTemplates = {
    outsourcing: function() {
      var h = '';
      h += guide('業務委託契約書は、外部に業務を依頼する際に必要な契約です。報酬、業務範囲、知的財産権の帰属を明確にしておくことでトラブルを防止できます。');
      h += sectionTitle('&#128101;', '当事者情報');
      h += '<div class="form-row"><div class="form-group">' + lbl('委託者（甲）の名称', true, '業務を依頼する側の会社名または個人名を入力します。法人の場合は正式な商号を記載してください。') + '<input type="text" class="form-input" id="partyA" placeholder="例：株式会社サンプル" required></div>';
      h += '<div class="form-group">' + lbl('委託者の住所', false, '契約書に記載する住所です。法人の場合は本店所在地、個人の場合は住民票の住所が一般的です。') + '<input type="text" class="form-input" id="partyAAddress" placeholder="例：東京都渋谷区神宮前1-1-1"></div></div>';
      h += '<div class="form-row"><div class="form-group">' + lbl('受託者（乙）の名称', true, '業務を受ける側（フリーランスなど）の名称です。') + '<input type="text" class="form-input" id="partyB" placeholder="例：山田 太郎" required></div>';
      h += '<div class="form-group">' + lbl('受託者の住所', false) + '<input type="text" class="form-input" id="partyBAddress" placeholder="例：東京都新宿区西新宿2-2-2"></div></div>';

      h += sectionTitle('&#128221;', '業務内容');
      h += '<div class="form-group">' + lbl('業務内容', true, '委託する業務をできるだけ具体的に記載してください。曖昧だと後からトラブルの原因になります。成果物がある場合はそれも明記しましょう。') + '<textarea class="form-textarea" id="workDescription" placeholder="例：Webサイトのデザイン及びコーディング業務\n- トップページデザイン\n- 下層ページ5ページのデザイン\n- HTML/CSSコーディング" required></textarea></div>';
      h += '<div class="form-group">' + lbl('契約形態', false, '「請負」は成果物の完成が目的（民法632条）、「準委任」は業務の遂行自体が目的（民法656条）です。成果物がある場合は請負、コンサルなどは準委任が適切です。') + '<select class="form-select" id="contractType"><option value="ukeoi">請負契約（成果物の完成が目的）</option><option value="juninin">準委任契約（業務遂行が目的）</option></select></div>';

      h += sectionTitle('&#128176;', '報酬・支払条件');
      h += '<div class="form-row"><div class="form-group">' + lbl('報酬金額', true, '税別の金額を入力してください。下請法対象の場合、60日以内の支払いが義務付けられています。') + '<input type="text" class="form-input" id="payment" placeholder="例：500,000" required><div class="form-hint">税別金額を数字で入力（カンマ可）</div></div>';
      h += '<div class="form-group">' + lbl('支払方法', false) + '<select class="form-select" id="paymentMethod"><option value="bank">銀行振込</option><option value="check">小切手</option><option value="other">その他</option></select></div></div>';
      h += '<div class="form-group">' + lbl('支払期限', false, '下請法が適用される場合、成果物受領日から60日以内に支払う義務があります（下請法第2条の2）。') + '<select class="form-select" id="paymentDeadline"><option value="30">納品月末締め翌月末払い</option><option value="end">納品月末払い</option><option value="15">納品月末締め翌月15日払い</option></select></div>';

      h += sectionTitle('&#128197;', '契約期間');
      h += '<div class="form-row"><div class="form-group">' + lbl('契約開始日', true) + '<input type="date" class="form-input" id="startDate" required></div>';
      h += '<div class="form-group">' + lbl('契約終了日', true) + '<input type="date" class="form-input" id="endDate" required></div></div>';
      h += '<div class="form-row"><div class="form-group">' + lbl('納品期限', false, '請負契約の場合は特に重要です。明確な期日を設定しましょう。') + '<input type="date" class="form-input" id="deadline"></div>';
      h += '<div class="form-group">' + lbl('自動更新', false, '期間満了後に自動で契約を更新するかどうかを選択します。') + '<select class="form-select" id="autoRenew"><option value="no">自動更新しない</option><option value="yes">自動更新する（1年単位）</option></select></div></div>';

      h += sectionTitle('&#128274;', '権利・義務');
      h += '<div class="form-group">' + lbl('知的財産権の帰属', false, '著作権法第27条（翻訳権等）・第28条（二次的著作物の利用権）を含めて移転する場合は、明示的に記載する必要があります（著作権法第61条第2項）。') + '<select class="form-select" id="ipRights"><option value="client">委託者（甲）に帰属</option><option value="contractor">受託者（乙）に帰属</option><option value="shared">共有</option></select></div>';
      h += '<div class="form-group">' + lbl('秘密保持条項', false, '取引で知り得た情報の漏洩を禁止する条項です。含めることを強く推奨します。') + '<select class="form-select" id="nda"><option value="yes">含める（推奨）</option><option value="no">含めない</option></select></div>';
      h += '<div class="form-group">' + lbl('再委託の可否', false, '受託者が業務の一部を第三者に再委託できるかどうかです。') + '<select class="form-select" id="subcontract"><option value="no">禁止（甲の書面承諾が必要）</option><option value="yes">許可</option></select></div>';
      h += '<div class="form-group">' + lbl('管轄裁判所', false, '紛争時に訴訟を行う裁判所です。自社の最寄りの地方裁判所を指定するのが一般的です。') + '<input type="text" class="form-input" id="jurisdiction" placeholder="例：東京地方裁判所"></div>';
      return h;
    },

    nda: function() {
      var h = '';
      h += guide('秘密保持契約書（NDA）は、商談や協業の前に機密情報の取り扱いを定める契約です。不正競争防止法上の「営業秘密」として保護を受けるためにも、秘密管理性を明確にすることが重要です。');
      h += sectionTitle('&#128101;', '当事者情報');
      h += '<div class="form-row"><div class="form-group">' + lbl('開示者（甲）の名称', true, '秘密情報を開示する側です。双方向NDAの場合は便宜上の区分です。') + '<input type="text" class="form-input" id="partyA" placeholder="例：株式会社サンプル" required></div>';
      h += '<div class="form-group">' + lbl('開示者の住所', false) + '<input type="text" class="form-input" id="partyAAddress" placeholder="例：東京都渋谷区..."></div></div>';
      h += '<div class="form-row"><div class="form-group">' + lbl('受領者（乙）の名称', true) + '<input type="text" class="form-input" id="partyB" placeholder="例：田中 次郎" required></div>';
      h += '<div class="form-group">' + lbl('受領者の住所', false) + '<input type="text" class="form-input" id="partyBAddress" placeholder="例：東京都新宿区..."></div></div>';

      h += sectionTitle('&#128221;', 'NDAの条件');
      h += '<div class="form-group">' + lbl('NDAの種類', false, '双方向NDA：お互いの情報を保護。片方向NDA：一方のみが情報を開示する場合。商談前の検討段階では双方向が一般的です。') + '<select class="form-select" id="ndaType"><option value="mutual">双方向（相互）NDA</option><option value="one-way">片方向NDA</option></select></div>';
      h += '<div class="form-group">' + lbl('秘密情報の定義', true, '何が秘密情報に該当するかを明確に定義します。広すぎると実効性が薄れ、狭すぎると保護漏れが生じます。') + '<textarea class="form-textarea" id="confidentialInfo" placeholder="例：本契約に関連して開示される技術情報、営業情報、顧客情報、財務情報、事業計画、ノウハウその他一切の情報" required></textarea></div>';
      h += '<div class="form-group">' + lbl('目的', true, '何のために秘密情報を開示するのかを明記します。目的外使用の禁止と紐づく重要な条項です。') + '<input type="text" class="form-input" id="purpose" placeholder="例：業務提携の検討のため" required></div>';

      h += sectionTitle('&#128197;', '期間・その他');
      h += '<div class="form-row"><div class="form-group">' + lbl('有効期間', true) + '<select class="form-select" id="duration" required><option value="1">1年間</option><option value="2">2年間</option><option value="3">3年間</option><option value="5">5年間</option><option value="indefinite">無期限</option></select></div>';
      h += '<div class="form-group">' + lbl('契約締結日', true) + '<input type="date" class="form-input" id="startDate" required></div></div>';
      h += '<div class="form-group">' + lbl('違約金', false, '違約金を定めることで抑止力を高められます。空欄の場合は損害賠償請求のみの規定となります。') + '<input type="text" class="form-input" id="penalty" placeholder="例：1,000,000（空欄の場合は損害賠償規定のみ）"></div>';
      h += '<div class="form-group">' + lbl('管轄裁判所', false) + '<input type="text" class="form-input" id="jurisdiction" placeholder="例：東京地方裁判所"></div>';
      return h;
    },

    sales: function() {
      var h = '';
      h += guide('売買契約書は、商品や製品の売買取引を明確にする契約です。民法第555条に基づき、目的物の特定、代金、引渡し条件、契約不適合責任（旧：瑕疵担保責任）を定めます。2020年民法改正により「契約不適合責任」に変更されています。');
      h += sectionTitle('&#128101;', '当事者情報');
      h += '<div class="form-row"><div class="form-group">' + lbl('売主（甲）の名称', true) + '<input type="text" class="form-input" id="partyA" placeholder="例：株式会社サンプル" required></div>';
      h += '<div class="form-group">' + lbl('売主の住所', false) + '<input type="text" class="form-input" id="partyAAddress" placeholder="例：東京都渋谷区..."></div></div>';
      h += '<div class="form-row"><div class="form-group">' + lbl('買主（乙）の名称', true) + '<input type="text" class="form-input" id="partyB" placeholder="例：株式会社テスト" required></div>';
      h += '<div class="form-group">' + lbl('買主の住所', false) + '<input type="text" class="form-input" id="partyBAddress" placeholder="例：東京都新宿区..."></div></div>';

      h += sectionTitle('&#128230;', '商品情報');
      h += '<div class="form-group">' + lbl('商品名・内容', true, '売買の対象を特定できるよう、品名・型番・数量などを具体的に記載してください。') + '<textarea class="form-textarea" id="productDescription" placeholder="例：業務用ソフトウェア「サンプルPro」ライセンス 10本" required></textarea></div>';

      h += sectionTitle('&#128176;', '代金・支払');
      h += '<div class="form-row"><div class="form-group">' + lbl('売買代金', true) + '<input type="text" class="form-input" id="payment" placeholder="例：1,000,000" required><div class="form-hint">税別金額を入力してください。</div></div>';
      h += '<div class="form-group">' + lbl('支払方法', false) + '<select class="form-select" id="paymentMethod"><option value="bank">銀行振込</option><option value="cash">現金</option><option value="other">その他</option></select></div></div>';
      h += '<div class="form-row"><div class="form-group">' + lbl('引渡し日', true) + '<input type="date" class="form-input" id="deliveryDate" required></div>';
      h += '<div class="form-group">' + lbl('支払期限', true) + '<input type="date" class="form-input" id="paymentDate" required></div></div>';

      h += sectionTitle('&#128666;', '引渡し・保証');
      h += '<div class="form-group">' + lbl('引渡し場所', false) + '<input type="text" class="form-input" id="deliveryPlace" placeholder="例：甲の本社所在地"></div>';
      h += '<div class="form-group">' + lbl('契約不適合責任期間', false, '2020年民法改正により「瑕疵担保責任」から「契約不適合責任」に変更されました（民法第562条〜第564条）。買主は不適合を知った時から1年以内に通知が必要です（民法第566条）。') + '<select class="form-select" id="warrantyPeriod"><option value="3m">引渡し後3ヶ月</option><option value="6m">引渡し後6ヶ月</option><option value="1y">引渡し後1年</option><option value="none">免除する</option></select></div>';
      h += '<div class="form-group">' + lbl('管轄裁判所', false) + '<input type="text" class="form-input" id="jurisdiction" placeholder="例：東京地方裁判所"></div>';
      return h;
    },

    employment: function() {
      var h = '';
      h += guide('雇用契約書は労働基準法第15条により、労働条件の書面明示が義務付けられています。2024年4月からは、有期契約の更新上限・無期転換ルールの明示も必要です。必須項目が多いため、漏れなく入力してください。');
      h += sectionTitle('&#128101;', '当事者情報');
      h += '<div class="form-row"><div class="form-group">' + lbl('使用者（甲）の名称', true, '雇用する会社名・事業者名です。') + '<input type="text" class="form-input" id="partyA" placeholder="例：株式会社サンプル" required></div>';
      h += '<div class="form-group">' + lbl('使用者の住所', false) + '<input type="text" class="form-input" id="partyAAddress" placeholder="例：東京都渋谷区..."></div></div>';
      h += '<div class="form-row"><div class="form-group">' + lbl('労働者（乙）の氏名', true) + '<input type="text" class="form-input" id="partyB" placeholder="例：鈴木 花子" required></div>';
      h += '<div class="form-group">' + lbl('労働者の住所', false) + '<input type="text" class="form-input" id="partyBAddress" placeholder="例：東京都新宿区..."></div></div>';

      h += sectionTitle('&#128188;', '雇用条件（労働基準法第15条 必須明示事項）');
      h += '<div class="form-row"><div class="form-group">' + lbl('雇用形態', true) + '<select class="form-select" id="employmentType" required><option value="fulltime">正社員（期間の定めなし）</option><option value="contract">契約社員（有期雇用）</option><option value="parttime">パート・アルバイト</option></select></div>';
      h += '<div class="form-group">' + lbl('試用期間', false, '試用期間を設ける場合、労働基準法上も解雇には合理的な理由が必要です（14日以内を除く）。一般的に3〜6ヶ月が多いです。') + '<select class="form-select" id="probation"><option value="none">なし</option><option value="3m">3ヶ月</option><option value="6m">6ヶ月</option></select></div></div>';

      h += '<div class="form-row"><div class="form-group">' + lbl('契約開始日', true) + '<input type="date" class="form-input" id="startDate" required></div>';
      h += '<div class="form-group">' + lbl('契約終了日（有期の場合）', false, '有期雇用の場合のみ入力。原則3年以内（労働基準法第14条）。5年超で無期転換権が発生します（労働契約法第18条）。') + '<input type="date" class="form-input" id="endDate"></div></div>';

      h += '<div class="form-group">' + lbl('就業場所', true, '労働基準法施行規則第5条で明示が義務付けられています。') + '<input type="text" class="form-input" id="workplace" placeholder="例：東京都渋谷区神宮前1-1-1 本社ビル5F" required></div>';
      h += '<div class="form-group">' + lbl('業務内容', true) + '<textarea class="form-textarea" id="workDescription" placeholder="例：Webアプリケーション開発業務全般" required></textarea></div>';

      h += sectionTitle('&#9200;', '勤務時間・休日');
      h += '<div class="form-row"><div class="form-group">' + lbl('始業時刻', true) + '<input type="time" class="form-input" id="workStart" value="09:00" required></div>';
      h += '<div class="form-group">' + lbl('終業時刻', true) + '<input type="time" class="form-input" id="workEnd" value="18:00" required></div></div>';
      h += '<div class="form-row"><div class="form-group">' + lbl('休憩時間', true, '6時間超で45分以上、8時間超で1時間以上の休憩が法律で義務付けられています（労働基準法第34条）。') + '<select class="form-select" id="breakTime" required><option value="45">45分</option><option value="60">60分（1時間）</option><option value="90">90分</option></select></div>';
      h += '<div class="form-group">' + lbl('所定労働時間', false) + '<input type="text" class="form-input" id="workHours" placeholder="例：8時間（自動計算されます）" readonly></div></div>';
      h += '<div class="form-group">' + lbl('休日', true, '少なくとも毎週1日、または4週間を通じ4日以上の休日が必要です（労働基準法第35条）。') + '<input type="text" class="form-input" id="holidays" placeholder="例：土曜日、日曜日、国民の祝日、年末年始（12/29〜1/3）" required></div>';

      h += sectionTitle('&#128176;', '賃金');
      h += '<div class="form-row"><div class="form-group">' + lbl('基本給', true, '月給・時給を指定してください。最低賃金法に基づく地域別最低賃金以上である必要があります。') + '<input type="text" class="form-input" id="salary" placeholder="例：300,000" required></div>';
      h += '<div class="form-group">' + lbl('賃金形態', true) + '<select class="form-select" id="salaryType" required><option value="monthly">月給制</option><option value="hourly">時給制</option><option value="daily">日給制</option></select></div></div>';
      h += '<div class="form-row"><div class="form-group">' + lbl('賃金締切日', true) + '<select class="form-select" id="payCutoff" required><option value="end">毎月末日</option><option value="15">毎月15日</option><option value="20">毎月20日</option><option value="25">毎月25日</option></select></div>';
      h += '<div class="form-group">' + lbl('賃金支払日', true) + '<select class="form-select" id="payDay" required><option value="25">翌月25日</option><option value="end">翌月末日</option><option value="15">翌月15日</option><option value="same25">当月25日</option></select></div></div>';
      h += '<div class="form-group">' + lbl('通勤手当', false) + '<select class="form-select" id="commute"><option value="actual">実費支給（上限あり）</option><option value="fixed">定額支給</option><option value="none">なし</option></select></div>';

      h += sectionTitle('&#128203;', 'その他');
      h += '<div class="form-group">' + lbl('年次有給休暇', false, '入社6ヶ月で10日付与が法定最低基準です（労働基準法第39条）。') + '<select class="form-select" id="paidLeave"><option value="legal">法定通り（6ヶ月継続勤務で10日〜）</option><option value="immediate">入社時付与</option></select></div>';
      h += '<div class="form-group">' + lbl('社会保険', false) + '<select class="form-select" id="insurance"><option value="full">健康保険・厚生年金・雇用保険・労災保険</option><option value="partial">雇用保険・労災保険のみ</option></select></div>';
      return h;
    },

    lease: function() {
      var h = '';
      h += guide('賃貸借契約書は借地借家法・民法第601条に基づく契約です。特に借地借家法は借主保護の強行規定が多いため、法律に反する特約は無効となる場合があります。原状回復については国土交通省ガイドラインに準拠した内容で作成します。');
      h += sectionTitle('&#128101;', '当事者情報');
      h += '<div class="form-row"><div class="form-group">' + lbl('賃貸人（甲）の名称', true) + '<input type="text" class="form-input" id="partyA" placeholder="例：山田 不動産株式会社" required></div>';
      h += '<div class="form-group">' + lbl('賃貸人の住所', false) + '<input type="text" class="form-input" id="partyAAddress" placeholder="例：東京都渋谷区..."></div></div>';
      h += '<div class="form-row"><div class="form-group">' + lbl('賃借人（乙）の名称', true) + '<input type="text" class="form-input" id="partyB" placeholder="例：株式会社テスト" required></div>';
      h += '<div class="form-group">' + lbl('賃借人の住所', false) + '<input type="text" class="form-input" id="partyBAddress" placeholder="例：東京都新宿区..."></div></div>';

      h += sectionTitle('&#127968;', '物件情報');
      h += '<div class="form-group">' + lbl('物件の名称・所在地', true, '登記簿上の表示と一致させてください。') + '<input type="text" class="form-input" id="propertyAddress" placeholder="例：サンプルビル301号室（東京都渋谷区神宮前1-1-1）" required></div>';
      h += '<div class="form-row"><div class="form-group">' + lbl('物件の種類', true) + '<select class="form-select" id="propertyType" required><option value="office">事務所・オフィス</option><option value="residence">居住用</option><option value="store">店舗</option><option value="warehouse">倉庫</option></select></div>';
      h += '<div class="form-group">' + lbl('面積', false) + '<input type="text" class="form-input" id="propertyArea" placeholder="例：50.5㎡"></div></div>';
      h += '<div class="form-group">' + lbl('使用目的', true, '用途を限定することで、無断での目的外使用を防止します。') + '<input type="text" class="form-input" id="purpose" placeholder="例：事務所として使用" required></div>';

      h += sectionTitle('&#128176;', '賃料・費用');
      h += '<div class="form-row"><div class="form-group">' + lbl('月額賃料', true) + '<input type="text" class="form-input" id="rent" placeholder="例：150,000" required><div class="form-hint">税別金額</div></div>';
      h += '<div class="form-group">' + lbl('共益費・管理費', false) + '<input type="text" class="form-input" id="managementFee" placeholder="例：10,000"></div></div>';
      h += '<div class="form-row"><div class="form-group">' + lbl('敷金', false, '敷金は賃料債務の担保です。退去時に原状回復費用を差し引いて返還されます（民法第622条の2）。') + '<input type="text" class="form-input" id="deposit" placeholder="例：300,000（賃料2ヶ月分）"></div>';
      h += '<div class="form-group">' + lbl('礼金', false) + '<input type="text" class="form-input" id="keyMoney" placeholder="例：150,000（賃料1ヶ月分）"></div></div>';
      h += '<div class="form-group">' + lbl('賃料支払日', false) + '<select class="form-select" id="payDay"><option value="prev_end">前月末日</option><option value="prev_25">前月25日</option><option value="current_end">当月末日</option></select></div>';

      h += sectionTitle('&#128197;', '契約期間');
      h += '<div class="form-row"><div class="form-group">' + lbl('契約開始日', true) + '<input type="date" class="form-input" id="startDate" required></div>';
      h += '<div class="form-group">' + lbl('契約期間', true, '普通借家契約は期間満了の1年前〜6ヶ月前までに通知がなければ同条件で更新されます（借地借家法第26条）。') + '<select class="form-select" id="leaseTerm" required><option value="1">1年</option><option value="2">2年</option><option value="3">3年</option><option value="5">5年</option></select></div></div>';
      h += '<div class="form-group">' + lbl('管轄裁判所', false) + '<input type="text" class="form-input" id="jurisdiction" placeholder="例：東京地方裁判所"></div>';
      return h;
    },

    partnership: function() {
      var h = '';
      h += guide('業務提携契約書は、企業間で協力して事業を行う際の取り決めです。共同事業の範囲、役割分担、費用負担、収益配分、知的財産の取り扱いなどを明確にします。独占禁止法に抵触しないよう注意が必要です。');
      h += sectionTitle('&#128101;', '当事者情報');
      h += '<div class="form-row"><div class="form-group">' + lbl('甲の名称', true) + '<input type="text" class="form-input" id="partyA" placeholder="例：株式会社サンプル" required></div>';
      h += '<div class="form-group">' + lbl('甲の住所', false) + '<input type="text" class="form-input" id="partyAAddress" placeholder="例：東京都渋谷区..."></div></div>';
      h += '<div class="form-row"><div class="form-group">' + lbl('乙の名称', true) + '<input type="text" class="form-input" id="partyB" placeholder="例：株式会社テスト" required></div>';
      h += '<div class="form-group">' + lbl('乙の住所', false) + '<input type="text" class="form-input" id="partyBAddress" placeholder="例：東京都新宿区..."></div></div>';

      h += sectionTitle('&#128221;', '提携内容');
      h += '<div class="form-group">' + lbl('提携の目的', true) + '<textarea class="form-textarea" id="purpose" placeholder="例：AIを活用した新規サービスの共同開発及び販売" required></textarea></div>';
      h += '<div class="form-group">' + lbl('甲の役割・業務分担', true) + '<textarea class="form-textarea" id="roleA" placeholder="例：サービスの企画、マーケティング、顧客対応" required></textarea></div>';
      h += '<div class="form-group">' + lbl('乙の役割・業務分担', true) + '<textarea class="form-textarea" id="roleB" placeholder="例：システム開発、インフラ運用、技術サポート" required></textarea></div>';

      h += sectionTitle('&#128176;', '費用・収益');
      h += '<div class="form-group">' + lbl('費用負担', false, '各自の費用負担の方法を選択します。') + '<select class="form-select" id="costShare"><option value="each">各自負担</option><option value="equal">折半</option><option value="ratio">比率指定</option></select></div>';
      h += '<div class="form-group">' + lbl('収益配分', false) + '<select class="form-select" id="profitShare"><option value="equal">折半（50:50）</option><option value="6040">60:40（甲:乙）</option><option value="7030">70:30（甲:乙）</option><option value="discuss">別途協議</option></select></div>';

      h += sectionTitle('&#128197;', '期間・その他');
      h += '<div class="form-row"><div class="form-group">' + lbl('契約開始日', true) + '<input type="date" class="form-input" id="startDate" required></div>';
      h += '<div class="form-group">' + lbl('契約期間', true) + '<select class="form-select" id="term" required><option value="1">1年</option><option value="2">2年</option><option value="3">3年</option><option value="5">5年</option></select></div></div>';
      h += '<div class="form-group">' + lbl('知的財産権', false) + '<select class="form-select" id="ipRights"><option value="each">各自の成果物は各自に帰属</option><option value="shared">共同成果物は共有</option><option value="partyA">甲に帰属</option></select></div>';
      h += '<div class="form-group">' + lbl('管轄裁判所', false) + '<input type="text" class="form-input" id="jurisdiction" placeholder="例：東京地方裁判所"></div>';
      return h;
    },

    terms: function() {
      var h = '';
      h += guide('利用規約はWebサービスの利用条件を定める規約です。電子消費者契約法・消費者契約法に基づき、不当に消費者の利益を害する条項は無効となります（消費者契約法第8〜10条）。特に免責条項は「事業者の故意・重過失」まで免責することはできません。');
      h += sectionTitle('&#127760;', 'サービス情報');
      h += '<div class="form-group">' + lbl('サービス名', true) + '<input type="text" class="form-input" id="serviceName" placeholder="例：SampleApp" required></div>';
      h += '<div class="form-group">' + lbl('運営会社名', true) + '<input type="text" class="form-input" id="companyName" placeholder="例：株式会社サンプル" required></div>';
      h += '<div class="form-group">' + lbl('サービスURL', false) + '<input type="text" class="form-input" id="serviceUrl" placeholder="例：https://example.com"></div>';
      h += '<div class="form-group">' + lbl('サービスの概要', true, 'どのようなサービスかを簡潔に記載してください。') + '<textarea class="form-textarea" id="serviceDesc" placeholder="例：インターネットを通じたプロジェクト管理ツールの提供" required></textarea></div>';

      h += sectionTitle('&#128100;', 'ユーザー関連');
      h += '<div class="form-group">' + lbl('会員登録の要否', false) + '<select class="form-select" id="registration"><option value="required">必要</option><option value="optional">任意（一部機能に必要）</option><option value="none">不要</option></select></div>';
      h += '<div class="form-group">' + lbl('年齢制限', false) + '<select class="form-select" id="ageLimit"><option value="none">なし</option><option value="13">13歳以上</option><option value="16">16歳以上</option><option value="18">18歳以上</option></select></div>';

      h += sectionTitle('&#128176;', '料金');
      h += '<div class="form-group">' + lbl('有料サービスの有無', false) + '<select class="form-select" id="hasPaid"><option value="yes">有料プランあり</option><option value="no">完全無料</option></select></div>';

      h += sectionTitle('&#128221;', 'その他');
      h += '<div class="form-group">' + lbl('ユーザー投稿コンテンツ', false, 'ユーザーがコンテンツを投稿できるサービスの場合は「あり」を選択してください。') + '<select class="form-select" id="ugc"><option value="yes">あり（コメント・投稿機能など）</option><option value="no">なし</option></select></div>';
      h += '<div class="form-group">' + lbl('準拠法', false) + '<select class="form-select" id="law"><option value="japan">日本法</option></select></div>';
      h += '<div class="form-group">' + lbl('管轄裁判所', false) + '<input type="text" class="form-input" id="jurisdiction" placeholder="例：東京地方裁判所"></div>';
      h += '<div class="form-group">' + lbl('施行日', true) + '<input type="date" class="form-input" id="effectiveDate" required></div>';
      return h;
    },

    privacy: function() {
      var h = '';
      h += guide('プライバシーポリシーは個人情報保護法（2022年4月改正施行）に基づき、個人情報の取扱いについて公表が義務付けられています。利用目的の特定（第17条）、取得時の通知（第21条）、安全管理措置（第23条）、第三者提供の制限（第27条）等に対応した内容です。');
      h += sectionTitle('&#127760;', '基本情報');
      h += '<div class="form-group">' + lbl('事業者名', true) + '<input type="text" class="form-input" id="companyName" placeholder="例：株式会社サンプル" required></div>';
      h += '<div class="form-group">' + lbl('サービス名', false) + '<input type="text" class="form-input" id="serviceName" placeholder="例：SampleApp"></div>';
      h += '<div class="form-group">' + lbl('個人情報保護管理者の連絡先', true, '個人情報保護法第32条に基づき、開示等の請求先を明示する必要があります。') + '<input type="text" class="form-input" id="contactEmail" placeholder="例：privacy@example.com" required></div>';
      h += '<div class="form-group">' + lbl('住所', false) + '<input type="text" class="form-input" id="companyAddress" placeholder="例：東京都渋谷区神宮前1-1-1"></div>';

      h += sectionTitle('&#128221;', '取得する個人情報');
      h += '<div class="form-group">' + lbl('取得する個人情報の種類', true, '取得する情報を選択してください。利用目的との整合性が重要です。') + '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:8px;">';
      var items = ['氏名','メールアドレス','電話番号','住所','生年月日','クレジットカード情報','IPアドレス・Cookie','位置情報','購入履歴'];
      items.forEach(function(item, i) {
        h += '<label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;color:var(--color-secondary);"><input type="checkbox" id="piType' + i + '" value="' + item + '" ' + (i < 3 ? 'checked' : '') + '>' + item + '</label>';
      });
      h += '</div></div>';

      h += '<div class="form-group">' + lbl('利用目的', true, '個人情報保護法第17条により、利用目的をできる限り特定する必要があります。') + '<textarea class="form-textarea" id="purposes" placeholder="例：\n・サービスの提供及び運営\n・ユーザーサポート対応\n・利用状況の分析及びサービス改善\n・新機能や更新情報のお知らせ" required></textarea></div>';

      h += sectionTitle('&#128274;', '第三者提供・委託');
      h += '<div class="form-group">' + lbl('第三者提供', false, '個人情報保護法第27条により、原則として本人の同意なく第三者に提供できません。') + '<select class="form-select" id="thirdParty"><option value="no">原則行わない</option><option value="consent">本人の同意を得た場合のみ</option><option value="yes">業務委託先に提供する場合あり</option></select></div>';
      h += '<div class="form-group">' + lbl('外国への移転', false, '個人情報保護法第28条に基づき、外国にある第三者への提供には追加の要件があります。') + '<select class="form-select" id="foreignTransfer"><option value="no">なし</option><option value="yes">あり（クラウドサービス利用等）</option></select></div>';
      h += '<div class="form-group">' + lbl('Cookieの使用', false) + '<select class="form-select" id="cookies"><option value="yes">使用する</option><option value="analytics">分析目的のみ使用</option><option value="no">使用しない</option></select></div>';
      h += '<div class="form-group">' + lbl('施行日', true) + '<input type="date" class="form-input" id="effectiveDate" required></div>';
      return h;
    },

    license: function() {
      var h = '';
      h += guide('ソフトウェアライセンス契約書は、著作権法に基づきソフトウェアの使用を許諾する契約です。著作権法第2条第1項第10号の5により、プログラムは著作物として保護されます。ライセンスの範囲、制限事項、保証を明確にすることが重要です。');
      h += sectionTitle('&#128101;', '当事者情報');
      h += '<div class="form-row"><div class="form-group">' + lbl('ライセンサー（甲）の名称', true, 'ソフトウェアの権利を持つ側です。') + '<input type="text" class="form-input" id="partyA" placeholder="例：株式会社サンプル" required></div>';
      h += '<div class="form-group">' + lbl('甲の住所', false) + '<input type="text" class="form-input" id="partyAAddress" placeholder="例：東京都渋谷区..."></div></div>';
      h += '<div class="form-row"><div class="form-group">' + lbl('ライセンシー（乙）の名称', true) + '<input type="text" class="form-input" id="partyB" placeholder="例：株式会社テスト" required></div>';
      h += '<div class="form-group">' + lbl('乙の住所', false) + '<input type="text" class="form-input" id="partyBAddress" placeholder="例：東京都新宿区..."></div></div>';

      h += sectionTitle('&#128187;', 'ソフトウェア情報');
      h += '<div class="form-group">' + lbl('ソフトウェア名', true) + '<input type="text" class="form-input" id="softwareName" placeholder="例：SamplePro Enterprise Edition" required></div>';
      h += '<div class="form-group">' + lbl('ソフトウェアの概要', false) + '<textarea class="form-textarea" id="softwareDesc" placeholder="例：企業向けプロジェクト管理ツール（バージョン3.0）"></textarea></div>';

      h += sectionTitle('&#128274;', 'ライセンス条件');
      h += '<div class="form-row"><div class="form-group">' + lbl('ライセンス形態', true) + '<select class="form-select" id="licenseType" required><option value="perpetual">永久ライセンス</option><option value="subscription">サブスクリプション（期間制）</option><option value="trial">評価版</option></select></div>';
      h += '<div class="form-group">' + lbl('ライセンス数', false) + '<input type="text" class="form-input" id="licenseCount" placeholder="例：10ユーザー"></div></div>';
      h += '<div class="form-group">' + lbl('使用範囲', false) + '<select class="form-select" id="scope"><option value="internal">乙の社内業務のみ</option><option value="group">乙のグループ会社含む</option><option value="unlimited">制限なし</option></select></div>';
      h += '<div class="form-row"><div class="form-group">' + lbl('ライセンス料', true) + '<input type="text" class="form-input" id="payment" placeholder="例：1,000,000" required></div>';
      h += '<div class="form-group">' + lbl('支払方法', false) + '<select class="form-select" id="paymentMethod"><option value="bank">銀行振込（一括）</option><option value="monthly">銀行振込（月額）</option><option value="yearly">銀行振込（年額）</option></select></div></div>';

      h += sectionTitle('&#128197;', '期間・保証');
      h += '<div class="form-row"><div class="form-group">' + lbl('契約開始日', true) + '<input type="date" class="form-input" id="startDate" required></div>';
      h += '<div class="form-group">' + lbl('契約期間（期間制の場合）', false) + '<select class="form-select" id="term"><option value="1">1年</option><option value="2">2年</option><option value="3">3年</option><option value="perpetual">無期限</option></select></div></div>';
      h += '<div class="form-group">' + lbl('保証期間', false) + '<select class="form-select" id="warranty"><option value="1y">1年間</option><option value="6m">6ヶ月</option><option value="90d">90日間</option><option value="none">保証なし（AS-IS）</option></select></div>';
      h += '<div class="form-group">' + lbl('管轄裁判所', false) + '<input type="text" class="form-input" id="jurisdiction" placeholder="例：東京地方裁判所"></div>';
      return h;
    },

    consulting: function() {
      var h = '';
      h += guide('顧問契約書は、弁護士・税理士・コンサルタント等に継続的に助言・相談を行う際の契約です。民法第643条（委任）に基づく準委任契約の形式が一般的です。業務範囲を明確にし、顧問料と追加費用の取り決めが重要です。');
      h += sectionTitle('&#128101;', '当事者情報');
      h += '<div class="form-row"><div class="form-group">' + lbl('委託者（甲）の名称', true) + '<input type="text" class="form-input" id="partyA" placeholder="例：株式会社サンプル" required></div>';
      h += '<div class="form-group">' + lbl('甲の住所', false) + '<input type="text" class="form-input" id="partyAAddress" placeholder="例：東京都渋谷区..."></div></div>';
      h += '<div class="form-row"><div class="form-group">' + lbl('顧問（乙）の名称', true) + '<input type="text" class="form-input" id="partyB" placeholder="例：田中法律事務所 弁護士 田中一郎" required></div>';
      h += '<div class="form-group">' + lbl('乙の住所', false) + '<input type="text" class="form-input" id="partyBAddress" placeholder="例：東京都千代田区..."></div></div>';

      h += sectionTitle('&#128221;', '顧問業務の内容');
      h += '<div class="form-group">' + lbl('顧問の種類', true) + '<select class="form-select" id="consultType" required><option value="legal">法務顧問（弁護士）</option><option value="tax">税務顧問（税理士）</option><option value="labor">労務顧問（社労士）</option><option value="business">経営コンサルタント</option><option value="it">ITコンサルタント</option><option value="other">その他</option></select></div>';
      h += '<div class="form-group">' + lbl('業務範囲', true, '顧問料に含まれる業務の範囲を明確にしてください。範囲外の業務は別途費用が発生する旨を定めます。') + '<textarea class="form-textarea" id="scope" placeholder="例：\n・法律相談（月5件まで）\n・契約書のレビュー（月3件まで）\n・社内規程の整備に関する助言" required></textarea></div>';

      h += sectionTitle('&#128176;', '報酬');
      h += '<div class="form-row"><div class="form-group">' + lbl('月額顧問料', true) + '<input type="text" class="form-input" id="monthlyFee" placeholder="例：100,000" required><div class="form-hint">税別金額</div></div>';
      h += '<div class="form-group">' + lbl('追加業務の報酬', false) + '<select class="form-select" id="additionalFee"><option value="hourly">タイムチャージ制（時間単価別途協議）</option><option value="project">案件ごとに見積り</option><option value="included">全て顧問料に含む</option></select></div></div>';
      h += '<div class="form-group">' + lbl('支払期限', false) + '<select class="form-select" id="paymentDeadline"><option value="end">毎月末日払い</option><option value="next_end">翌月末日払い</option><option value="25">毎月25日払い</option></select></div>';

      h += sectionTitle('&#128197;', '契約期間');
      h += '<div class="form-row"><div class="form-group">' + lbl('契約開始日', true) + '<input type="date" class="form-input" id="startDate" required></div>';
      h += '<div class="form-group">' + lbl('契約期間', true) + '<select class="form-select" id="term" required><option value="1">1年</option><option value="2">2年</option><option value="6m">6ヶ月</option></select></div></div>';
      h += '<div class="form-group">' + lbl('管轄裁判所', false) + '<input type="text" class="form-input" id="jurisdiction" placeholder="例：東京地方裁判所"></div>';
      return h;
    }
  };

  // --- Contract Generators ---
  // Part 2 of the code will add these via GENERATORS object
  var contractGenerators = {};

  // =========================
  // OUTSOURCING GENERATOR
  // =========================
  contractGenerators.outsourcing = function() {
    var pA = getVal('partyA') || '（甲の名称）';
    var pAAddr = getVal('partyAAddress') || '（甲の住所）';
    var pB = getVal('partyB') || '（乙の名称）';
    var pBAddr = getVal('partyBAddress') || '（乙の住所）';
    var work = getVal('workDescription') || '（業務内容）';
    var cType = getVal('contractType');
    var payment = getVal('payment');
    var pMethod = getPaymentMethodText(getVal('paymentMethod'));
    var sDate = formatDate(getVal('startDate'));
    var eDate = formatDate(getVal('endDate'));
    var dl = getVal('deadline') ? formatDate(getVal('deadline')) : '甲乙協議の上定める日';
    var pDead = getPaymentDeadlineText(getVal('paymentDeadline'));
    var ipR = getIpRightsText(getVal('ipRights'));
    var incNda = getVal('nda') === 'yes';
    var subC = getVal('subcontract') !== 'yes';
    var autoR = getVal('autoRenew') === 'yes';
    var jur = getVal('jurisdiction') || '東京地方裁判所';
    var cTypeName = cType === 'juninin' ? '準委任' : '請負';

    var h = '<div class="article-title">業務委託契約書</div><div class="article-body">';
    h += '<p>' + pA + '（以下「甲」という）と' + pB + '（以下「乙」という）は、以下のとおり業務委託契約（以下「本契約」という）を締結する。</p>';

    var n = 1;
    h += '<p><strong>第' + n + '条（目的）</strong></p>';
    h += '<p>甲は、以下に定める業務（以下「本業務」という）を乙に委託し、乙はこれを受託する。本契約は民法上の' + cTypeName + '契約とする。</p>';

    n++;
    h += '<p><strong>第' + n + '条（業務内容）</strong></p>';
    h += '<p>乙が甲より委託を受ける業務の内容は、以下のとおりとする。</p>';
    h += '<p>' + work.replace(/\n/g, '<br>') + '</p>';

    n++;
    h += '<p><strong>第' + n + '条（契約期間）</strong></p>';
    h += '<p>本契約の有効期間は、' + sDate + 'から' + eDate + 'までとする。</p>';
    if (autoR) {
      h += '<p>2. 期間満了の1ヶ月前までに甲乙いずれからも書面による終了の意思表示がない場合、本契約は同一条件にてさらに1年間更新されるものとし、以後も同様とする。</p>';
    }

    if (cType !== 'juninin') {
      n++;
      h += '<p><strong>第' + n + '条（納品）</strong></p>';
      h += '<p>乙は、本業務の成果物を' + dl + 'までに甲に納品するものとする。納品の方法は、甲乙協議の上定める。</p>';

      n++;
      h += '<p><strong>第' + n + '条（検収）</strong></p>';
      h += '<p>1. 甲は、成果物の納品を受けた日から10営業日以内（以下「検収期間」という）に検収を行い、合否を乙に書面にて通知するものとする。</p>';
      h += '<p>2. 甲が検収期間内に通知をしない場合は、検収に合格したものとみなす。</p>';
      h += '<p>3. 検収不合格の場合、乙は甲の指示に従い、合理的な期間内に無償で修正を行うものとする。</p>';
    }

    n++;
    h += '<p><strong>第' + n + '条（報酬）</strong></p>';
    h += '<p>甲は乙に対し、本業務の対価として' + formatMoney(payment) + '（税別）を支払うものとする。消費税は別途甲が負担する。</p>';

    n++;
    h += '<p><strong>第' + n + '条（支払方法及び支払期限）</strong></p>';
    h += '<p>甲は前条の報酬を、' + pDead + 'にて、' + pMethod + 'により乙の指定する口座に振り込む方法で支払うものとする。振込手数料は甲の負担とする。</p>';

    n++;
    h += '<p><strong>第' + n + '条（知的財産権）</strong></p>';
    h += '<p>' + ipR + '</p>';

    if (incNda) {
      n++;
      h += '<p><strong>第' + n + '条（秘密保持）</strong></p>';
      h += '<p>1. 甲及び乙は、本契約に関連して知り得た相手方の技術上、営業上その他一切の秘密情報（以下「秘密情報」という）を、相手方の事前の書面による承諾なく第三者に開示・漏洩してはならない。</p>';
      h += '<p>2. 前項にかかわらず、次の各号に該当する情報は秘密情報から除外する。</p>';
      h += '<p>（1）開示時点で既に公知の情報 （2）開示後に受領者の責めによらず公知となった情報 （3）開示時点で受領者が既に保有していた情報 （4）正当な権限を有する第三者から秘密保持義務を負わずに取得した情報</p>';
      h += '<p>3. 本条の義務は、本契約終了後3年間存続するものとする。</p>';
    }

    if (subC) {
      n++;
      h += '<p><strong>第' + n + '条（再委託の禁止）</strong></p>';
      h += '<p>乙は、甲の事前の書面による承諾なく、本業務の全部又は一部を第三者に再委託してはならない。</p>';
    }

    n++;
    h += '<p><strong>第' + n + '条（契約解除）</strong></p>';
    h += '<p>1. 甲又は乙は、相手方が次の各号のいずれかに該当した場合、何らの催告なく直ちに本契約を解除することができる。</p>';
    h += '<p>（1）本契約に違反し、相当期間を定めた催告にもかかわらず是正されないとき （2）支払停止又は支払不能となったとき （3）破産手続開始、民事再生手続開始、会社更生手続開始の申立てがあったとき （4）解散又は事業の全部もしくは重要な一部の譲渡を決議したとき</p>';

    n++;
    h += '<p><strong>第' + n + '条（損害賠償）</strong></p>';
    h += '<p>甲又は乙は、本契約に違反して相手方に損害を与えた場合、その直接かつ現実に生じた損害を賠償する責任を負う。ただし、賠償額は本契約に定める報酬額を上限とする。</p>';

    n++;
    h += antiSocialClause(n);

    n++;
    h += '<p><strong>第' + n + '条（不可抗力）</strong></p>';
    h += '<p>天災地変、戦争、テロ、感染症の蔓延、法令の改廃その他の不可抗力により、本契約の全部又は一部の履行が不能又は遅延した場合、いずれの当事者もその責任を負わない。</p>';

    n++;
    h += '<p><strong>第' + n + '条（管轄裁判所）</strong></p>';
    h += '<p>本契約に関する一切の紛争については、' + jur + 'を第一審の専属的合意管轄裁判所とする。</p>';

    n++;
    h += '<p><strong>第' + n + '条（協議事項）</strong></p>';
    h += '<p>本契約に定めのない事項又は本契約の解釈に疑義が生じた事項については、甲乙誠意をもって協議し、解決を図るものとする。</p>';

    h += signBlock(pA, pAAddr, pB, pBAddr);
    h += '</div>';
    return h;
  };

  // =========================
  // NDA GENERATOR
  // =========================
  contractGenerators.nda = function() {
    var pA = getVal('partyA') || '（甲の名称）';
    var pAAddr = getVal('partyAAddress') || '（甲の住所）';
    var pB = getVal('partyB') || '（乙の名称）';
    var pBAddr = getVal('partyBAddress') || '（乙の住所）';
    var ndaT = getVal('ndaType') || 'mutual';
    var confI = getVal('confidentialInfo') || '本契約に関連して開示される技術情報、営業情報、顧客情報その他一切の情報';
    var dur = getVal('duration') || '1';
    var sDate = formatDate(getVal('startDate'));
    var purp = getVal('purpose') || '業務提携の検討';
    var pen = getVal('penalty');
    var jur = getVal('jurisdiction') || '東京地方裁判所';
    var isMut = ndaT === 'mutual';
    var durText = dur === 'indefinite' ? '無期限' : dur + '年間';

    var h = '<div class="article-title">秘密保持契約書</div><div class="article-body">';
    h += '<p>' + pA + '（以下「甲」という）と' + pB + '（以下「乙」という）は、' + purp + '（以下「本目的」という）に関し、以下のとおり秘密保持契約（以下「本契約」という）を締結する。</p>';

    var n = 1;
    h += '<p><strong>第' + n + '条（秘密情報の定義）</strong></p>';
    h += '<p>1. 本契約において「秘密情報」とは、' + (isMut ? '甲又は乙が相手方に対して' : '甲が乙に対して') + '開示する以下の情報をいう。ただし、開示の方法（書面、口頭、電子データ、その他の媒体）を問わない。</p>';
    h += '<p>' + confI + '</p>';
    h += '<p>2. 書面で開示する場合は「秘密」等の表示を付すものとし、口頭で開示する場合は開示時に秘密である旨を告げ、開示後14日以内に書面にて秘密情報の内容を特定するものとする。</p>';

    n++;
    h += '<p><strong>第' + n + '条（秘密情報の除外）</strong></p>';
    h += '<p>以下の各号に該当する情報は、秘密情報から除外する。</p>';
    h += '<p>（1）開示を受けた時点で、既に公知であったもの<br>（2）開示を受けた後に、受領者の責めによらず公知となったもの<br>（3）開示を受けた時点で、受領者が既に正当に保有していたことを証明できるもの<br>（4）正当な権限を有する第三者から秘密保持義務を負わずに適法に入手したもの<br>（5）受領者が秘密情報を利用することなく独自に開発したことを証明できるもの<br>（6）法令又は裁判所もしくは行政機関の命令により開示が義務付けられたもの</p>';

    n++;
    h += '<p><strong>第' + n + '条（秘密保持義務）</strong></p>';
    h += '<p>1. ' + (isMut ? '甲及び乙（以下「受領者」という場合がある）' : '乙') + 'は、秘密情報を善良なる管理者の注意をもって管理し、本目的以外に使用してはならない。</p>';
    h += '<p>2. 受領者は、秘密情報を開示者の事前の書面による同意なく第三者に開示・漏洩してはならない。ただし、本目的のために合理的に必要な範囲内で、自己の役員及び従業員に対して開示する場合はこの限りでない。この場合、受領者は当該役員及び従業員に本契約と同等の秘密保持義務を課すものとする。</p>';

    n++;
    h += '<p><strong>第' + n + '条（複製の制限）</strong></p>';
    h += '<p>受領者は、本目的のために合理的に必要な範囲でのみ秘密情報を複製することができる。複製物についても秘密情報として取り扱うものとする。</p>';

    n++;
    h += '<p><strong>第' + n + '条（返還・廃棄義務）</strong></p>';
    h += '<p>受領者は、開示者から要求があった場合、又は本契約が終了した場合には、秘密情報（複製物を含む）を速やかに開示者に返還し、又は開示者の指示に従い廃棄するものとする。廃棄した場合は、その旨を書面にて開示者に通知するものとする。</p>';

    n++;
    h += '<p><strong>第' + n + '条（知的財産権）</strong></p>';
    h += '<p>秘密情報の開示は、当該情報に関するいかなる知的財産権の譲渡又はライセンスの許諾を意味するものではない。</p>';

    n++;
    h += '<p><strong>第' + n + '条（有効期間）</strong></p>';
    h += '<p>本契約の有効期間は、' + sDate + 'から' + durText + 'とする。ただし、秘密保持義務は、本契約終了後も3年間は存続するものとする。</p>';

    n++;
    if (pen) {
      h += '<p><strong>第' + n + '条（違約金）</strong></p>';
      h += '<p>本契約に違反した当事者は、相手方に対し、違約金として' + formatMoney(pen) + 'を支払うものとする。ただし、相手方はこれを超える損害の賠償を請求することを妨げない。</p>';
    } else {
      h += '<p><strong>第' + n + '条（損害賠償）</strong></p>';
      h += '<p>本契約に違反した当事者は、相手方に対し、当該違反により生じた損害（逸失利益を含む）を賠償する責任を負う。</p>';
    }

    n++;
    h += antiSocialClause(n);

    n++;
    h += '<p><strong>第' + n + '条（管轄裁判所）</strong></p>';
    h += '<p>本契約に関する一切の紛争については、' + jur + 'を第一審の専属的合意管轄裁判所とする。</p>';

    n++;
    h += '<p><strong>第' + n + '条（協議事項）</strong></p>';
    h += '<p>本契約に定めのない事項又は本契約の解釈に疑義が生じた事項については、甲乙誠意をもって協議し、解決を図るものとする。</p>';

    h += signBlock(pA, pAAddr, pB, pBAddr);
    h += '</div>';
    return h;
  };

  // =========================
  // SALES GENERATOR
  // =========================
  contractGenerators.sales = function() {
    var pA = getVal('partyA') || '（甲の名称）';
    var pAAddr = getVal('partyAAddress') || '（甲の住所）';
    var pB = getVal('partyB') || '（乙の名称）';
    var pBAddr = getVal('partyBAddress') || '（乙の住所）';
    var prod = getVal('productDescription') || '（商品名・内容）';
    var payment = getVal('payment');
    var pMethod = getPaymentMethodText(getVal('paymentMethod'));
    var delDate = formatDate(getVal('deliveryDate'));
    var payDate = formatDate(getVal('paymentDate'));
    var delPlace = getVal('deliveryPlace') || '甲の本社所在地';
    var wMap = { '3m': '3ヶ月間', '6m': '6ヶ月間', '1y': '1年間', 'none': '' };
    var warranty = wMap[getVal('warrantyPeriod')] || '6ヶ月間';
    var hasWarranty = getVal('warrantyPeriod') !== 'none';
    var jur = getVal('jurisdiction') || '東京地方裁判所';

    var h = '<div class="article-title">売買契約書</div><div class="article-body">';
    h += '<p>' + pA + '（以下「甲」という）と' + pB + '（以下「乙」という）は、以下のとおり売買契約（以下「本契約」という）を締結する。</p>';

    var n = 1;
    h += '<p><strong>第' + n + '条（目的）</strong></p>';
    h += '<p>甲は乙に対し、以下の商品（以下「本商品」という）を売り渡し、乙はこれを買い受ける。</p>';
    h += '<p>' + prod.replace(/\n/g, '<br>') + '</p>';

    n++;
    h += '<p><strong>第' + n + '条（売買代金）</strong></p>';
    h += '<p>本商品の売買代金は、' + formatMoney(payment) + '（税別）とする。消費税は別途乙が負担する。</p>';

    n++;
    h += '<p><strong>第' + n + '条（支払方法及び支払期限）</strong></p>';
    h += '<p>乙は甲に対し、前条の売買代金及び消費税相当額を、' + payDate + 'までに、' + pMethod + 'により甲の指定する口座に振り込む方法で支払うものとする。振込手数料は乙の負担とする。</p>';

    n++;
    h += '<p><strong>第' + n + '条（引渡し）</strong></p>';
    h += '<p>甲は乙に対し、本商品を' + delDate + 'までに' + delPlace + 'にて引き渡すものとする。</p>';

    n++;
    h += '<p><strong>第' + n + '条（危険負担）</strong></p>';
    h += '<p>本商品の引渡し前に生じた滅失、毀損その他一切の損害は甲の負担とし、引渡し後に生じた損害は乙の負担とする。ただし、相手方の責めに帰すべき事由による場合はこの限りでない（民法第567条）。</p>';

    n++;
    h += '<p><strong>第' + n + '条（検収）</strong></p>';
    h += '<p>1. 乙は、本商品の引渡しを受けた後、速やかに検査を行うものとする。</p>';
    h += '<p>2. 乙は、品質、数量等に契約内容との不適合がある場合は、引渡し日から7日以内に甲に書面にて通知するものとする。当該期間内に通知がない場合は、検収に合格したものとみなす。</p>';

    if (hasWarranty) {
      n++;
      h += '<p><strong>第' + n + '条（契約不適合責任）</strong></p>';
      h += '<p>1. 甲は、本商品の引渡し後' + warranty + '以内に発見された契約不適合（種類、品質又は数量に関して契約の内容に適合しないもの）について、乙の請求に基づき、修補、代替物の引渡し、代金の減額又は損害賠償を行うものとする（民法第562条〜第564条）。</p>';
      h += '<p>2. 乙は、契約不適合を知った時から1年以内にその旨を甲に通知しなければならない（民法第566条）。</p>';
    }

    n++;
    h += '<p><strong>第' + n + '条（所有権の移転）</strong></p>';
    h += '<p>本商品の所有権は、乙が売買代金の全額を支払った時点で、甲から乙に移転するものとする。</p>';

    n++;
    h += '<p><strong>第' + n + '条（契約解除）</strong></p>';
    h += '<p>甲又は乙は、相手方が本契約に違反し、相当期間を定めて催告しても是正されない場合、本契約を解除することができる。</p>';

    n++;
    h += '<p><strong>第' + n + '条（損害賠償）</strong></p>';
    h += '<p>甲又は乙は、本契約に違反して相手方に損害を与えた場合、その損害を賠償する責任を負う。</p>';

    n++;
    h += antiSocialClause(n);

    n++;
    h += '<p><strong>第' + n + '条（管轄裁判所）</strong></p>';
    h += '<p>本契約に関する一切の紛争については、' + jur + 'を第一審の専属的合意管轄裁判所とする。</p>';

    n++;
    h += '<p><strong>第' + n + '条（協議事項）</strong></p>';
    h += '<p>本契約に定めのない事項又は本契約の解釈に疑義が生じた事項については、甲乙誠意をもって協議し、解決を図るものとする。</p>';

    h += signBlock(pA, pAAddr, pB, pBAddr);
    h += '</div>';
    return h;
  };

  // =========================
  // EMPLOYMENT GENERATOR
  // =========================
  contractGenerators.employment = function() {
    var pA = getVal('partyA') || '（甲の名称）';
    var pAAddr = getVal('partyAAddress') || '（甲の住所）';
    var pB = getVal('partyB') || '（乙の名称）';
    var pBAddr = getVal('partyBAddress') || '（乙の住所）';
    var empType = getVal('employmentType');
    var probation = getVal('probation');
    var sDate = formatDate(getVal('startDate'));
    var eDate = getVal('endDate') ? formatDate(getVal('endDate')) : '';
    var workplace = getVal('workplace') || '（就業場所）';
    var work = getVal('workDescription') || '（業務内容）';
    var wStart = getVal('workStart') || '09:00';
    var wEnd = getVal('workEnd') || '18:00';
    var breakT = getVal('breakTime') || '60';
    var holidays = getVal('holidays') || '土曜日、日曜日、国民の祝日、年末年始';
    var salary = getVal('salary');
    var salaryType = getVal('salaryType');
    var payCutoff = getVal('payCutoff');
    var payDay = getVal('payDay');
    var commute = getVal('commute');
    var paidLeave = getVal('paidLeave');
    var insurance = getVal('insurance');

    var salaryTypeMap = { monthly: '月給', hourly: '時給', daily: '日給' };
    var cutoffMap = { end: '毎月末日', '15': '毎月15日', '20': '毎月20日', '25': '毎月25日' };
    var payDayMap = { '25': '翌月25日', end: '翌月末日', '15': '翌月15日', same25: '当月25日' };
    var commuteMap = { actual: '実費を支給する（月額上限50,000円）', fixed: '定額を支給する', none: '支給しない' };
    var empTypeMap = { fulltime: '期間の定めのない雇用（正社員）', contract: '有期雇用契約', parttime: 'パートタイム労働契約' };
    var probMap = { none: '', '3m': '3ヶ月', '6m': '6ヶ月' };

    var h = '<div class="article-title">雇用契約書</div><div class="article-body">';
    h += '<p style="font-size:0.85em;color:#6e6e73;text-align:center;margin-bottom:20px;">（労働基準法第15条に基づく労働条件通知書を兼ねる）</p>';
    h += '<p>' + pA + '（以下「甲」という）と' + pB + '（以下「乙」という）は、以下のとおり雇用契約（以下「本契約」という）を締結する。</p>';

    var n = 1;
    h += '<p><strong>第' + n + '条（雇用形態及び契約期間）</strong></p>';
    h += '<p>1. 甲は乙を' + empTypeMap[empType] + 'として雇用する。</p>';
    if (empType === 'contract' && eDate) {
      h += '<p>2. 契約期間は、' + sDate + 'から' + eDate + 'までとする。</p>';
      h += '<p>3. 契約の更新の有無：甲乙協議の上決定する。更新する場合の判断基準は、業務量、勤務成績、能力、会社の経営状況等による。</p>';
    } else {
      h += '<p>2. 雇用開始日は' + sDate + 'とする。</p>';
    }

    if (probation !== 'none') {
      n++;
      h += '<p><strong>第' + n + '条（試用期間）</strong></p>';
      h += '<p>1. 入社日から' + probMap[probation] + 'を試用期間とする。</p>';
      h += '<p>2. 試用期間中又は試用期間満了時に、勤務態度、能力等を総合的に判断し、本採用の可否を決定する。</p>';
      h += '<p>3. 試用期間中の労働条件は本契約と同一とする。</p>';
    }

    n++;
    h += '<p><strong>第' + n + '条（就業場所）</strong></p>';
    h += '<p>' + workplace + '</p>';
    h += '<p>※就業場所の変更がありうる場合：甲は業務上の必要により、就業場所を変更することがある。</p>';

    n++;
    h += '<p><strong>第' + n + '条（業務内容）</strong></p>';
    h += '<p>' + work.replace(/\n/g, '<br>') + '</p>';
    h += '<p>※業務内容の変更がありうる場合：甲は業務上の必要により、業務内容を変更することがある。</p>';

    n++;
    h += '<p><strong>第' + n + '条（始業・終業時刻及び休憩時間）</strong></p>';
    h += '<p>1. 始業時刻：' + wStart + '</p>';
    h += '<p>2. 終業時刻：' + wEnd + '</p>';
    h += '<p>3. 休憩時間：' + breakT + '分</p>';
    h += '<p>4. 所定時間外労働の有無：有（業務の都合により、所定労働時間を超えて労働を命ずることがある。この場合、労働基準法第36条に基づく協定の範囲内とする。）</p>';

    n++;
    h += '<p><strong>第' + n + '条（休日）</strong></p>';
    h += '<p>' + holidays + '</p>';

    n++;
    h += '<p><strong>第' + n + '条（年次有給休暇）</strong></p>';
    if (paidLeave === 'immediate') {
      h += '<p>入社日に10日の年次有給休暇を付与する。以後は労働基準法第39条に基づき付与する。</p>';
    } else {
      h += '<p>6ヶ月間継続勤務し、全労働日の8割以上出勤した場合、10日の年次有給休暇を付与する。以後は労働基準法第39条に基づき付与する。</p>';
    }

    n++;
    h += '<p><strong>第' + n + '条（賃金）</strong></p>';
    h += '<p>1. ' + salaryTypeMap[salaryType] + '：' + formatMoney(salary) + '</p>';
    h += '<p>2. 賃金締切日：' + cutoffMap[payCutoff] + '</p>';
    h += '<p>3. 賃金支払日：' + payDayMap[payDay] + '</p>';
    h += '<p>4. 支払方法：乙の指定する銀行口座への振込</p>';
    h += '<p>5. 時間外労働割増賃金：法定時間外労働に対しては25%以上、法定休日労働に対しては35%以上、深夜労働（22時〜5時）に対しては25%以上の割増賃金を支払う（労働基準法第37条）。</p>';
    h += '<p>6. 通勤手当：' + commuteMap[commute] + '</p>';

    n++;
    h += '<p><strong>第' + n + '条（社会保険等）</strong></p>';
    if (insurance === 'full') {
      h += '<p>健康保険、厚生年金保険、雇用保険及び労災保険に加入する。</p>';
    } else {
      h += '<p>雇用保険及び労災保険に加入する。</p>';
    }

    n++;
    h += '<p><strong>第' + n + '条（退職及び解雇）</strong></p>';
    h += '<p>1. 乙が自己都合により退職する場合は、少なくとも30日前までに甲に書面にて届け出なければならない。</p>';
    h += '<p>2. 甲が乙を解雇する場合は、少なくとも30日前に予告するか、又は30日分以上の平均賃金（解雇予告手当）を支払うものとする（労働基準法第20条）。ただし、労働者の責めに帰すべき事由に基づく場合で、労働基準監督署長の認定を受けたときはこの限りでない。</p>';
    h += '<p>3. 解雇事由：就業規則に定める解雇事由による。</p>';

    n++;
    h += '<p><strong>第' + n + '条（秘密保持）</strong></p>';
    h += '<p>乙は、在職中及び退職後において、業務上知り得た甲の技術上、営業上の秘密情報を第三者に漏洩してはならない。</p>';

    n++;
    h += '<p><strong>第' + n + '条（その他）</strong></p>';
    h += '<p>本契約に定めのない事項については、労働基準法その他の関係法令及び甲の就業規則の定めるところによる。</p>';

    h += signBlock(pA, pAAddr, pB, pBAddr);
    h += '</div>';
    return h;
  };

  // =========================
  // LEASE GENERATOR
  // =========================
  contractGenerators.lease = function() {
    var pA = getVal('partyA') || '（甲の名称）';
    var pAAddr = getVal('partyAAddress') || '（甲の住所）';
    var pB = getVal('partyB') || '（乙の名称）';
    var pBAddr = getVal('partyBAddress') || '（乙の住所）';
    var propAddr = getVal('propertyAddress') || '（物件所在地）';
    var propType = getVal('propertyType');
    var propArea = getVal('propertyArea') || '（面積）';
    var purpose = getVal('purpose') || '事務所';
    var rent = getVal('rent');
    var mgmtFee = getVal('managementFee');
    var deposit = getVal('deposit');
    var keyMoney = getVal('keyMoney');
    var payDayVal = getVal('payDay');
    var sDate = formatDate(getVal('startDate'));
    var leaseTerm = getVal('leaseTerm') || '2';
    var jur = getVal('jurisdiction') || '東京地方裁判所';

    var propTypeMap = { office: '事務所', residence: '居住用建物', store: '店舗', warehouse: '倉庫' };
    var payDayLease = { prev_end: '前月末日まで', prev_25: '前月25日まで', current_end: '当月末日まで' };

    var h = '<div class="article-title">建物賃貸借契約書</div><div class="article-body">';
    h += '<p>' + pA + '（以下「甲」という）と' + pB + '（以下「乙」という）は、以下のとおり建物賃貸借契約（以下「本契約」という）を締結する。</p>';

    var n = 1;
    h += '<p><strong>第' + n + '条（目的物）</strong></p>';
    h += '<p>甲は乙に対し、以下の建物（以下「本物件」という）を賃貸し、乙はこれを賃借する。</p>';
    h += '<p>所在地：' + propAddr + '<br>種類：' + propTypeMap[propType] + '<br>面積：' + propArea + '</p>';

    n++;
    h += '<p><strong>第' + n + '条（使用目的）</strong></p>';
    h += '<p>乙は、本物件を' + purpose + 'の目的でのみ使用するものとし、甲の書面による事前の承諾なく使用目的を変更してはならない。</p>';

    n++;
    h += '<p><strong>第' + n + '条（契約期間）</strong></p>';
    h += '<p>1. 本契約の期間は、' + sDate + 'から' + leaseTerm + '年間とする。</p>';
    h += '<p>2. 甲又は乙が、期間満了の1年前から6ヶ月前までの間に相手方に対して更新をしない旨の通知をしなかった場合は、従前の契約と同一の条件で契約を更新したものとみなす（借地借家法第26条）。</p>';

    n++;
    h += '<p><strong>第' + n + '条（賃料）</strong></p>';
    h += '<p>1. 月額賃料：' + formatMoney(rent) + '（税別）</p>';
    if (mgmtFee) {
      h += '<p>2. 共益費・管理費：月額' + formatMoney(mgmtFee) + '</p>';
    }

    n++;
    h += '<p><strong>第' + n + '条（賃料の支払方法）</strong></p>';
    h += '<p>乙は、毎月の賃料' + (mgmtFee ? '及び共益費' : '') + 'を、' + payDayLease[payDayVal] + 'に、甲の指定する銀行口座に振り込む方法で支払うものとする。振込手数料は乙の負担とする。</p>';

    if (deposit) {
      n++;
      h += '<p><strong>第' + n + '条（敷金）</strong></p>';
      h += '<p>1. 乙は甲に対し、本契約に基づく一切の債務の担保として、敷金' + formatMoney(deposit) + 'を本契約締結時に預託する。</p>';
      h += '<p>2. 甲は、本契約の終了後、本物件の明渡しを受けた日から合理的期間内に、敷金から乙の未払賃料その他本契約に基づく乙の債務を控除した残額を乙に返還する（民法第622条の2）。</p>';
    }

    if (keyMoney) {
      n++;
      h += '<p><strong>第' + n + '条（礼金）</strong></p>';
      h += '<p>乙は甲に対し、礼金として' + formatMoney(keyMoney) + 'を本契約締結時に支払う。礼金は契約終了後も返還しない。</p>';
    }

    n++;
    h += '<p><strong>第' + n + '条（賃料の改定）</strong></p>';
    h += '<p>甲又は乙は、租税公課の増減、経済事情の変動、近隣の賃料水準の変動その他の事由により賃料が不相当となった場合、賃料の増減を請求することができる（借地借家法第32条）。</p>';

    n++;
    h += '<p><strong>第' + n + '条（修繕）</strong></p>';
    h += '<p>1. 本物件の維持保全に必要な修繕は甲の負担で行う。ただし、乙の責めに帰すべき事由による修繕は乙の負担とする。</p>';
    h += '<p>2. 甲が修繕義務を履行しない場合、乙は自ら修繕し、その費用を甲に請求することができる（民法第607条の2）。</p>';

    n++;
    h += '<p><strong>第' + n + '条（禁止事項）</strong></p>';
    h += '<p>乙は、甲の書面による事前の承諾なく、次の各号の行為をしてはならない。</p>';
    h += '<p>（1）本物件の全部又は一部を第三者に転貸すること（2）賃借権を譲渡すること（3）本物件の増改築又は模様替えを行うこと（4）使用目的を変更すること</p>';

    n++;
    h += '<p><strong>第' + n + '条（原状回復）</strong></p>';
    h += '<p>1. 乙は、本契約の終了時に、通常の使用による損耗及び経年変化を除き、本物件を原状に回復して甲に明け渡すものとする。</p>';
    h += '<p>2. 原状回復の範囲及び費用負担については、国土交通省「原状回復をめぐるトラブルとガイドライン」に準拠するものとする。</p>';

    n++;
    h += '<p><strong>第' + n + '条（契約の解除）</strong></p>';
    h += '<p>1. 甲は、乙が次の各号のいずれかに該当した場合、催告の上、本契約を解除することができる。</p>';
    h += '<p>（1）賃料を2ヶ月分以上滞納したとき（2）第' + (n - 2) + '条の禁止事項に違反したとき（3）その他本契約に著しく違反したとき</p>';
    h += '<p>2. 乙は、1ヶ月前までに甲に書面にて通知することにより、本契約を解約することができる。</p>';

    n++;
    h += antiSocialClause(n);

    n++;
    h += '<p><strong>第' + n + '条（管轄裁判所）</strong></p>';
    h += '<p>本契約に関する一切の紛争については、' + jur + 'を第一審の専属的合意管轄裁判所とする。</p>';

    n++;
    h += '<p><strong>第' + n + '条（協議事項）</strong></p>';
    h += '<p>本契約に定めのない事項又は解釈に疑義が生じた事項については、民法及び借地借家法の規定に従い、甲乙誠意をもって協議し解決を図るものとする。</p>';

    h += signBlock(pA, pAAddr, pB, pBAddr);
    h += '</div>';
    return h;
  };

  // =========================
  // PARTNERSHIP GENERATOR
  // =========================
  contractGenerators.partnership = function() {
    var pA = getVal('partyA') || '（甲の名称）';
    var pAAddr = getVal('partyAAddress') || '（甲の住所）';
    var pB = getVal('partyB') || '（乙の名称）';
    var pBAddr = getVal('partyBAddress') || '（乙の住所）';
    var purpose = getVal('purpose') || '（提携目的）';
    var roleA = getVal('roleA') || '（甲の役割）';
    var roleB = getVal('roleB') || '（乙の役割）';
    var costShare = getVal('costShare');
    var profitShare = getVal('profitShare');
    var sDate = formatDate(getVal('startDate'));
    var term = getVal('term') || '1';
    var ipRights = getVal('ipRights');
    var jur = getVal('jurisdiction') || '東京地方裁判所';

    var costMap = { each: '各自が負担する', equal: '甲乙が折半する', ratio: '甲乙が別途協議の上定める比率で負担する' };
    var profitMap = { equal: '均等に配分する（50:50）', '6040': '甲60%、乙40%の比率で配分する', '7030': '甲70%、乙30%の比率で配分する', discuss: '別途甲乙協議の上定める' };
    var ipMap = { each: '各自が単独で創出した知的財産は、各自に帰属する。', shared: '本提携により共同で創出した知的財産は、甲乙の共有とする。共有持分は均等とする。', partyA: '本提携により生じた一切の知的財産権は甲に帰属する。' };

    var h = '<div class="article-title">業務提携契約書</div><div class="article-body">';
    h += '<p>' + pA + '（以下「甲」という）と' + pB + '（以下「乙」という）は、以下のとおり業務提携契約（以下「本契約」という）を締結する。</p>';

    var n = 1;
    h += '<p><strong>第' + n + '条（目的）</strong></p>';
    h += '<p>甲及び乙は、以下の事業（以下「本事業」という）において相互に協力し、業務提携を行うことを目的とする。</p>';
    h += '<p>' + purpose.replace(/\n/g, '<br>') + '</p>';

    n++;
    h += '<p><strong>第' + n + '条（業務分担）</strong></p>';
    h += '<p>1. 甲の業務：' + roleA.replace(/\n/g, '<br>') + '</p>';
    h += '<p>2. 乙の業務：' + roleB.replace(/\n/g, '<br>') + '</p>';
    h += '<p>3. 上記以外の業務については、甲乙協議の上分担を決定する。</p>';

    n++;
    h += '<p><strong>第' + n + '条（費用負担）</strong></p>';
    h += '<p>本事業の遂行に必要な費用は、' + costMap[costShare] + '</p>';

    n++;
    h += '<p><strong>第' + n + '条（収益配分）</strong></p>';
    h += '<p>本事業から生じた収益は、必要経費を控除した後、' + profitMap[profitShare] + '</p>';

    n++;
    h += '<p><strong>第' + n + '条（知的財産権）</strong></p>';
    h += '<p>' + ipMap[ipRights] + '</p>';

    n++;
    h += '<p><strong>第' + n + '条（秘密保持）</strong></p>';
    h += '<p>甲及び乙は、本契約に関連して知り得た相手方の秘密情報を、相手方の事前の書面による承諾なく第三者に開示・漏洩してはならない。本条の義務は、本契約終了後3年間存続する。</p>';

    n++;
    h += '<p><strong>第' + n + '条（競業避止）</strong></p>';
    h += '<p>甲及び乙は、本契約の有効期間中、相手方の書面による事前の承諾なく、本事業と競合する事業を自ら行い又は第三者と提携して行ってはならない。</p>';

    n++;
    h += '<p><strong>第' + n + '条（契約期間）</strong></p>';
    h += '<p>1. 本契約の有効期間は、' + sDate + 'から' + term + '年間とする。</p>';
    h += '<p>2. 期間満了の3ヶ月前までに甲乙いずれからも書面による終了の意思表示がない場合、本契約は同一条件にてさらに1年間更新されるものとし、以後も同様とする。</p>';

    n++;
    h += '<p><strong>第' + n + '条（中途解約）</strong></p>';
    h += '<p>甲又は乙は、3ヶ月前までに書面により相手方に通知することにより、本契約を解約することができる。</p>';

    n++;
    h += '<p><strong>第' + n + '条（契約解除）</strong></p>';
    h += '<p>甲又は乙は、相手方が本契約に違反し、相当期間を定めて催告しても是正されない場合、又は相手方が支払停止、破産等の申立てを受けた場合、直ちに本契約を解除することができる。</p>';

    n++;
    h += '<p><strong>第' + n + '条（残存条項）</strong></p>';
    h += '<p>本契約の終了後も、知的財産権、秘密保持、損害賠償及び管轄裁判所に関する規定はなお有効に存続する。</p>';

    n++;
    h += antiSocialClause(n);

    n++;
    h += '<p><strong>第' + n + '条（管轄裁判所）</strong></p>';
    h += '<p>本契約に関する一切の紛争については、' + jur + 'を第一審の専属的合意管轄裁判所とする。</p>';

    n++;
    h += '<p><strong>第' + n + '条（協議事項）</strong></p>';
    h += '<p>本契約に定めのない事項又は解釈に疑義が生じた事項については、甲乙誠意をもって協議し解決を図るものとする。</p>';

    h += signBlock(pA, pAAddr, pB, pBAddr);
    h += '</div>';
    return h;
  };

  // =========================
  // TERMS OF SERVICE GENERATOR
  // =========================
  contractGenerators.terms = function() {
    var sName = getVal('serviceName') || '（サービス名）';
    var cName = getVal('companyName') || '（運営会社名）';
    var sUrl = getVal('serviceUrl') || '';
    var sDesc = getVal('serviceDesc') || '（サービス概要）';
    var reg = getVal('registration');
    var age = getVal('ageLimit');
    var hasPaid = getVal('hasPaid') === 'yes';
    var ugc = getVal('ugc') === 'yes';
    var jur = getVal('jurisdiction') || '東京地方裁判所';
    var effDate = formatDate(getVal('effectiveDate'));

    var h = '<div class="article-title">' + sName + ' 利用規約</div><div class="article-body">';

    var n = 1;
    h += '<p><strong>第' + n + '条（適用）</strong></p>';
    h += '<p>1. この利用規約（以下「本規約」という）は、' + cName + '（以下「当社」という）が提供する「' + sName + '」（以下「本サービス」という）の利用に関する条件を定めるものです。</p>';
    h += '<p>2. 本サービスを利用するすべてのユーザー（以下「ユーザー」という）は、本規約に同意した上で本サービスを利用するものとします。</p>';

    n++;
    h += '<p><strong>第' + n + '条（サービスの内容）</strong></p>';
    h += '<p>' + sDesc + '</p>';
    h += '<p>当社は、ユーザーに事前に通知することなく、本サービスの内容を変更し、又は本サービスの提供を中止することができるものとします。</p>';

    if (reg !== 'none') {
      n++;
      h += '<p><strong>第' + n + '条（アカウント登録）</strong></p>';
      h += '<p>1. 本サービスの利用' + (reg === 'required' ? 'には' : 'の一部機能には') + 'アカウント登録が必要です。</p>';
      h += '<p>2. ユーザーは、登録情報について真実、正確かつ最新の情報を提供しなければなりません。</p>';
      h += '<p>3. ユーザーは、自己のアカウント及びパスワードを適切に管理する責任を負い、第三者に利用させたり、譲渡、貸与等してはなりません。</p>';
      h += '<p>4. アカウントの不正使用により生じた損害について、当社は一切の責任を負いません。</p>';
    }

    if (age !== 'none') {
      n++;
      h += '<p><strong>第' + n + '条（年齢制限）</strong></p>';
      h += '<p>' + age + '歳未満の方は、本サービスを利用することはできません。' + (parseInt(age) < 18 ? '未成年者が利用する場合、法定代理人の同意を得た上で利用するものとします。' : '') + '</p>';
    }

    n++;
    h += '<p><strong>第' + n + '条（禁止事項）</strong></p>';
    h += '<p>ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>';
    h += '<p>（1）法令又は公序良俗に違反する行為<br>（2）犯罪行為に関連する行為<br>（3）当社のサーバー又はネットワークの機能を破壊し、又は妨害する行為<br>（4）当社のサービスの運営を妨害するおそれのある行為<br>（5）他のユーザー又は第三者の知的財産権、肖像権、プライバシー、名誉その他の権利又は利益を侵害する行為<br>（6）不正アクセスをし、又はこれを試みる行為<br>（7）他のユーザーの個人情報等を収集又は蓄積する行為<br>（8）反社会的勢力に対して直接又は間接に利益を供与する行為<br>（9）その他、当社が不適切と判断する行為</p>';

    if (ugc) {
      n++;
      h += '<p><strong>第' + n + '条（ユーザーコンテンツ）</strong></p>';
      h += '<p>1. ユーザーが本サービスに投稿又はアップロードしたコンテンツ（以下「ユーザーコンテンツ」という）の著作権は、当該ユーザーに帰属します。</p>';
      h += '<p>2. ユーザーは、当社に対し、ユーザーコンテンツを本サービスの提供、改善及び宣伝の目的で使用する非独占的なライセンスを付与するものとします。</p>';
      h += '<p>3. 当社は、ユーザーコンテンツが本規約又は法令に違反すると判断した場合、事前の通知なく当該コンテンツを削除できるものとします。</p>';
    }

    if (hasPaid) {
      n++;
      h += '<p><strong>第' + n + '条（有料サービス）</strong></p>';
      h += '<p>1. 本サービスの一部は有料です。料金及び支払方法は、本サービス上に表示するとおりとします。</p>';
      h += '<p>2. ユーザーが有料サービスの利用料金を支払った後は、当社に帰責事由がある場合を除き、返金には応じません。</p>';
      h += '<p>3. 有料プランの解約は、次回請求日の前日までに手続きを行うことで、次回以降の課金を停止できます。</p>';
    }

    n++;
    h += '<p><strong>第' + n + '条（免責事項）</strong></p>';
    h += '<p>1. 当社は、本サービスに事実上又は法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥を含みますが、これらに限りません）がないことを明示的にも黙示的にも保証しません。</p>';
    h += '<p>2. 当社は、本サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。ただし、当社の故意又は重大な過失による場合はこの限りでありません（消費者契約法第8条）。</p>';
    h += '<p>3. 当社がユーザーに対して損害賠償責任を負う場合、当該ユーザーが当社に支払った過去12ヶ月間のサービス利用料の総額を上限とします。</p>';

    n++;
    h += '<p><strong>第' + n + '条（サービスの中断・停止）</strong></p>';
    h += '<p>当社は、以下の場合には、事前の通知なく本サービスの全部又は一部の提供を中断又は停止することができるものとします。</p>';
    h += '<p>（1）本サービスにかかるシステムの保守点検又は更新を行う場合<br>（2）地震、落雷、火災、停電その他の不可抗力により本サービスの提供が困難となった場合<br>（3）その他、当社が本サービスの提供が困難と判断した場合</p>';

    n++;
    h += '<p><strong>第' + n + '条（利用制限及びアカウント削除）</strong></p>';
    h += '<p>当社は、ユーザーが本規約に違反した場合又はそのおそれがあると判断した場合、事前の通知なく当該ユーザーの本サービスの利用を制限し、又はアカウントを削除することができるものとします。</p>';

    n++;
    h += '<p><strong>第' + n + '条（本規約の変更）</strong></p>';
    h += '<p>1. 当社は、必要と判断した場合には、ユーザーに通知することなく本規約を変更できるものとします。</p>';
    h += '<p>2. 変更後の利用規約は、本サービス上に表示した時点から効力を生じるものとします。</p>';
    h += '<p>3. 本規約の変更がユーザーの一般の利益に反する場合は、変更の効力発生時期を定め、変更する旨、変更後の内容及び効力発生時期を事前にユーザーに周知するものとします（民法第548条の4）。</p>';

    n++;
    h += '<p><strong>第' + n + '条（準拠法及び管轄裁判所）</strong></p>';
    h += '<p>1. 本規約の解釈にあたっては、日本法を準拠法とします。</p>';
    h += '<p>2. 本サービスに関して紛争が生じた場合には、' + jur + 'を第一審の専属的合意管轄裁判所とします。</p>';

    h += '<p style="margin-top:40px;text-align:right;">制定日：' + effDate + '</p>';
    h += '<p style="text-align:right;">' + cName + '</p>';
    h += '</div>';
    return h;
  };

  // =========================
  // PRIVACY POLICY GENERATOR
  // =========================
  contractGenerators.privacy = function() {
    var cName = getVal('companyName') || '（事業者名）';
    var sName = getVal('serviceName') || '当社サービス';
    var contact = getVal('contactEmail') || '（連絡先）';
    var cAddr = getVal('companyAddress') || '';
    var purposes = getVal('purposes') || '・サービスの提供及び運営\n・ユーザーサポート\n・サービス改善';
    var thirdParty = getVal('thirdParty');
    var foreign = getVal('foreignTransfer');
    var cookies = getVal('cookies');
    var effDate = formatDate(getVal('effectiveDate'));

    // Collect checked personal info types
    var piTypes = [];
    for (var i = 0; i < 9; i++) {
      var cb = document.getElementById('piType' + i);
      if (cb && cb.checked) piTypes.push(cb.value);
    }
    var piList = piTypes.length > 0 ? piTypes.join('、') : '氏名、メールアドレス';

    var h = '<div class="article-title">プライバシーポリシー</div><div class="article-body">';
    h += '<p>' + cName + '（以下「当社」という）は、' + sName + '（以下「本サービス」という）における個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」という）を定めます。</p>';

    var n = 1;
    h += '<p><strong>第' + n + '条（個人情報の定義）</strong></p>';
    h += '<p>本ポリシーにおいて「個人情報」とは、個人情報の保護に関する法律（以下「個人情報保護法」という）第2条第1項に定める個人情報をいいます。</p>';

    n++;
    h += '<p><strong>第' + n + '条（取得する個人情報）</strong></p>';
    h += '<p>当社は、本サービスの提供にあたり、以下の個人情報を取得する場合があります。</p>';
    h += '<p>' + piList + '</p>';

    n++;
    h += '<p><strong>第' + n + '条（個人情報の利用目的）</strong></p>';
    h += '<p>当社は、取得した個人情報を以下の目的で利用します（個人情報保護法第17条）。</p>';
    h += '<p>' + purposes.replace(/\n/g, '<br>') + '</p>';
    h += '<p>当社は、上記の利用目的の達成に必要な範囲を超えて個人情報を取り扱いません。利用目的を変更する場合は、変更前の利用目的と関連性を有すると合理的に認められる範囲で行い、変更後の利用目的をユーザーに通知又は公表します（個人情報保護法第17条第2項）。</p>';

    n++;
    h += '<p><strong>第' + n + '条（個人情報の取得方法）</strong></p>';
    h += '<p>当社は、ユーザーが本サービスを利用する際に、適法かつ公正な手段により個人情報を取得します（個人情報保護法第20条）。</p>';

    n++;
    h += '<p><strong>第' + n + '条（安全管理措置）</strong></p>';
    h += '<p>当社は、個人情報の漏洩、滅失又は毀損の防止その他の個人情報の安全管理のために、以下の措置を講じます（個人情報保護法第23条）。</p>';
    h += '<p>（1）組織的安全管理措置：個人情報保護管理者の設置、取扱規程の整備<br>（2）人的安全管理措置：従業者への教育・研修の実施<br>（3）物理的安全管理措置：入退室管理、機器の盗難防止措置<br>（4）技術的安全管理措置：アクセス制御、通信の暗号化、不正アクセス防止措置</p>';

    n++;
    h += '<p><strong>第' + n + '条（第三者提供）</strong></p>';
    h += '<p>1. 当社は、以下の場合を除き、あらかじめユーザーの同意を得ることなく、個人情報を第三者に提供しません（個人情報保護法第27条）。</p>';
    h += '<p>（1）法令に基づく場合<br>（2）人の生命、身体又は財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき<br>（3）公衆衛生の向上又は児童の健全な育成の推進のために特に必要がある場合<br>（4）国の機関もしくは地方公共団体又はその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合</p>';
    if (thirdParty === 'yes') {
      h += '<p>2. 当社は、利用目的の達成に必要な範囲内において、個人情報の取扱いの全部又は一部を業務委託先に委託する場合があります。この場合、当社は委託先に対して必要かつ適切な監督を行います（個人情報保護法第25条）。</p>';
    }

    if (foreign === 'yes') {
      n++;
      h += '<p><strong>第' + n + '条（外国にある第三者への提供）</strong></p>';
      h += '<p>当社は、本サービスの提供のため、クラウドサービスの利用等により、外国にある第三者に個人情報を提供する場合があります。この場合、個人情報保護法第28条に基づき、当該外国における個人情報の保護に関する制度等について情報提供を行った上で、ユーザーの同意を取得します。</p>';
    }

    if (cookies !== 'no') {
      n++;
      h += '<p><strong>第' + n + '条（Cookie等の使用）</strong></p>';
      h += '<p>1. 当社は、本サービスにおいてCookie及び類似の技術を使用します。</p>';
      if (cookies === 'analytics') {
        h += '<p>2. Cookieは、サービスの利用状況の分析の目的でのみ使用します。</p>';
      } else {
        h += '<p>2. Cookieは、サービスの提供、利用状況の分析、広告配信の最適化等の目的で使用します。</p>';
      }
      h += '<p>3. ユーザーは、ブラウザの設定によりCookieを無効にすることができます。ただし、一部のサービスが正常に機能しなくなる場合があります。</p>';
    }

    n++;
    h += '<p><strong>第' + n + '条（開示・訂正・利用停止等の請求）</strong></p>';
    h += '<p>1. ユーザーは、当社が保有する自己の個人情報について、個人情報保護法の定めに基づき、開示、訂正、追加、削除、利用停止又は消去を請求することができます（個人情報保護法第33条〜第35条）。</p>';
    h += '<p>2. 上記請求は、以下の窓口までご連絡ください。</p>';
    h += '<p>個人情報に関するお問い合わせ窓口：' + contact + '</p>';
    if (cAddr) h += '<p>住所：' + cAddr + '</p>';

    n++;
    h += '<p><strong>第' + n + '条（個人情報の漏洩等への対応）</strong></p>';
    h += '<p>当社は、個人情報の漏洩、滅失又は毀損が発生した場合、速やかにその事実を調査し、個人情報保護委員会への報告及び本人への通知を行います（個人情報保護法第26条）。</p>';

    n++;
    h += '<p><strong>第' + n + '条（本ポリシーの変更）</strong></p>';
    h += '<p>当社は、法令の改正、社会情勢の変化等に応じて、本ポリシーを変更することがあります。変更した場合は、本サービス上で公表するものとします。</p>';

    h += '<p style="margin-top:40px;text-align:right;">制定日：' + effDate + '</p>';
    h += '<p style="text-align:right;">' + cName + '</p>';
    if (cAddr) h += '<p style="text-align:right;">' + cAddr + '</p>';
    h += '</div>';
    return h;
  };

  // =========================
  // SOFTWARE LICENSE GENERATOR
  // =========================
  contractGenerators.license = function() {
    var pA = getVal('partyA') || '（甲の名称）';
    var pAAddr = getVal('partyAAddress') || '（甲の住所）';
    var pB = getVal('partyB') || '（乙の名称）';
    var pBAddr = getVal('partyBAddress') || '（乙の住所）';
    var swName = getVal('softwareName') || '（ソフトウェア名）';
    var swDesc = getVal('softwareDesc') || '';
    var licType = getVal('licenseType');
    var licCount = getVal('licenseCount') || '1ユーザー';
    var scope = getVal('scope');
    var payment = getVal('payment');
    var payMethod = getVal('paymentMethod');
    var sDate = formatDate(getVal('startDate'));
    var term = getVal('term');
    var warranty = getVal('warranty');
    var jur = getVal('jurisdiction') || '東京地方裁判所';

    var licTypeMap = { perpetual: '永久ライセンス', subscription: 'サブスクリプションライセンス', trial: '評価版ライセンス' };
    var scopeMap = { internal: '乙の社内業務目的に限る', group: '乙及び乙のグループ会社の業務目的に限る', unlimited: '制限なし' };
    var payMap = { bank: '銀行振込（一括払い）', monthly: '銀行振込（月額払い）', yearly: '銀行振込（年額払い）' };
    var warrantyMap = { '1y': '1年間', '6m': '6ヶ月間', '90d': '90日間', none: '' };

    var h = '<div class="article-title">ソフトウェアライセンス契約書</div><div class="article-body">';
    h += '<p>' + pA + '（以下「甲」という）と' + pB + '（以下「乙」という）は、以下のとおりソフトウェアライセンス契約（以下「本契約」という）を締結する。</p>';

    var n = 1;
    h += '<p><strong>第' + n + '条（定義）</strong></p>';
    h += '<p>本契約において「本ソフトウェア」とは、甲が開発し著作権を有する「' + swName + '」' + (swDesc ? '（' + swDesc + '）' : '') + 'をいい、関連するドキュメント、アップデート及びパッチを含む。</p>';

    n++;
    h += '<p><strong>第' + n + '条（使用許諾）</strong></p>';
    h += '<p>1. 甲は乙に対し、本契約の条件に従い、本ソフトウェアの非独占的な使用権を許諾する（' + licTypeMap[licType] + '）。</p>';
    h += '<p>2. 許諾ユーザー数：' + licCount + '</p>';
    h += '<p>3. 使用範囲：' + scopeMap[scope] + '</p>';
    h += '<p>4. 本ソフトウェアの著作権その他一切の知的財産権は甲に帰属し、本契約により乙に移転するものではない（著作権法第2条第1項第10号の5）。</p>';

    n++;
    h += '<p><strong>第' + n + '条（制限事項）</strong></p>';
    h += '<p>乙は、以下の行為を行ってはならない。</p>';
    h += '<p>（1）本ソフトウェアの複製（バックアップ目的の1部を除く）<br>（2）本ソフトウェアの改変、翻案、リバースエンジニアリング、逆コンパイル又は逆アセンブル<br>（3）本ソフトウェアの第三者への再許諾、譲渡、貸与又は頒布<br>（4）本ソフトウェアに付された著作権表示その他の権利表示の除去又は変更<br>（5）本ソフトウェアを利用した競合製品の開発</p>';

    n++;
    h += '<p><strong>第' + n + '条（ライセンス料）</strong></p>';
    h += '<p>乙は甲に対し、本ソフトウェアのライセンス料として' + formatMoney(payment) + '（税別）を、' + payMap[payMethod] + 'にて甲の指定する口座に支払うものとする。</p>';

    n++;
    h += '<p><strong>第' + n + '条（契約期間）</strong></p>';
    if (licType === 'perpetual') {
      h += '<p>本契約は' + sDate + 'に発効し、解除されない限り存続する。</p>';
    } else {
      h += '<p>1. 本契約は' + sDate + 'に発効し、' + (term === 'perpetual' ? '解除されない限り存続する' : term + '年間有効とする') + '。</p>';
      if (term !== 'perpetual') {
        h += '<p>2. 期間満了の1ヶ月前までに甲乙いずれからも書面による終了の意思表示がない場合、本契約は同一条件にてさらに1年間更新されるものとし、以後も同様とする。</p>';
      }
    }

    if (warranty !== 'none') {
      n++;
      h += '<p><strong>第' + n + '条（保証）</strong></p>';
      h += '<p>1. 甲は、本契約締結日から' + warrantyMap[warranty] + '（以下「保証期間」という）、本ソフトウェアが仕様書に記載された機能を実質的に有することを保証する。</p>';
      h += '<p>2. 保証期間中に仕様と異なる不具合が発見された場合、甲は合理的な期間内に無償で修正又は代替品の提供を行うものとする。</p>';
      h += '<p>3. 上記の保証は、乙の誤使用、改変、甲が指定しない環境での使用に起因する不具合には適用されない。</p>';
    }

    n++;
    h += '<p><strong>第' + n + '条（責任の制限）</strong></p>';
    h += '<p>1. ' + (warranty === 'none' ? '本ソフトウェアは現状有姿（AS-IS）で提供され、甲は明示又は黙示を問わず一切の保証を行わない。' : '前条に定める保証を除き、甲はいかなる保証も行わない。') + '</p>';
    h += '<p>2. 甲は、本ソフトウェアの使用に関して乙に生じた間接損害、特別損害、逸失利益について責任を負わない。</p>';
    h += '<p>3. いかなる場合においても、甲の損害賠償責任は、乙が甲に支払ったライセンス料の総額を上限とする。</p>';

    n++;
    h += '<p><strong>第' + n + '条（契約解除）</strong></p>';
    h += '<p>1. 甲又は乙は、相手方が本契約に違反し、催告後30日以内に是正されない場合、本契約を解除することができる。</p>';
    h += '<p>2. 本契約が終了した場合、乙は本ソフトウェア及びその複製物を速やかに破棄するものとする。</p>';

    n++;
    h += '<p><strong>第' + n + '条（秘密保持）</strong></p>';
    h += '<p>甲及び乙は、本契約に関連して知り得た相手方の秘密情報を、本契約の目的以外に使用せず、第三者に開示しないものとする。</p>';

    n++;
    h += antiSocialClause(n);

    n++;
    h += '<p><strong>第' + n + '条（管轄裁判所）</strong></p>';
    h += '<p>本契約に関する一切の紛争については、' + jur + 'を第一審の専属的合意管轄裁判所とする。</p>';

    n++;
    h += '<p><strong>第' + n + '条（協議事項）</strong></p>';
    h += '<p>本契約に定めのない事項については、甲乙誠意をもって協議し解決を図るものとする。</p>';

    h += signBlock(pA, pAAddr, pB, pBAddr);
    h += '</div>';
    return h;
  };

  // =========================
  // CONSULTING GENERATOR
  // =========================
  contractGenerators.consulting = function() {
    var pA = getVal('partyA') || '（甲の名称）';
    var pAAddr = getVal('partyAAddress') || '（甲の住所）';
    var pB = getVal('partyB') || '（乙の名称）';
    var pBAddr = getVal('partyBAddress') || '（乙の住所）';
    var cType = getVal('consultType');
    var scope = getVal('scope') || '（業務範囲）';
    var mFee = getVal('monthlyFee');
    var addFee = getVal('additionalFee');
    var payDead = getVal('paymentDeadline');
    var sDate = formatDate(getVal('startDate'));
    var term = getVal('term');
    var jur = getVal('jurisdiction') || '東京地方裁判所';

    var cTypeMap = { legal: '法務顧問', tax: '税務顧問', labor: '労務顧問', business: '経営顧問', it: 'IT顧問', other: '顧問' };
    var addFeeMap = { hourly: 'タイムチャージ制により、別途協議の上定める時間単価に基づき算定する', project: '案件ごとに甲乙協議の上見積りを行い決定する', included: '顧問料に含むものとする' };
    var payDeadMap = { end: '当月末日', next_end: '翌月末日', '25': '当月25日' };
    var termMap = { '1': '1年間', '2': '2年間', '6m': '6ヶ月間' };

    var h = '<div class="article-title">顧問契約書</div><div class="article-body">';
    h += '<p>' + pA + '（以下「甲」という）と' + pB + '（以下「乙」という）は、以下のとおり' + cTypeMap[cType] + '契約（以下「本契約」という）を締結する。本契約は民法第656条に基づく準委任契約とする。</p>';

    var n = 1;
    h += '<p><strong>第' + n + '条（目的）</strong></p>';
    h += '<p>甲は乙に対し、甲の' + cTypeMap[cType] + 'として、以下に定める業務（以下「顧問業務」という）を委託し、乙はこれを受託する。</p>';

    n++;
    h += '<p><strong>第' + n + '条（業務範囲）</strong></p>';
    h += '<p>乙が甲に提供する顧問業務の範囲は、以下のとおりとする。</p>';
    h += '<p>' + scope.replace(/\n/g, '<br>') + '</p>';
    h += '<p>上記の範囲を超える業務（以下「追加業務」という）については、別途甲乙協議の上対応を決定する。</p>';

    n++;
    h += '<p><strong>第' + n + '条（善管注意義務）</strong></p>';
    h += '<p>乙は、顧問業務の遂行にあたり、善良な管理者の注意をもって、専門家として適切な助言及び指導を行うものとする（民法第644条）。</p>';

    n++;
    h += '<p><strong>第' + n + '条（顧問料）</strong></p>';
    h += '<p>1. 甲は乙に対し、顧問業務の対価として、月額' + formatMoney(mFee) + '（税別）を支払うものとする。</p>';
    h += '<p>2. 追加業務の報酬は、' + addFeeMap[addFee] + '。</p>';
    h += '<p>3. 顧問業務に要する交通費その他の実費は、原則として甲の負担とする。</p>';

    n++;
    h += '<p><strong>第' + n + '条（支払方法）</strong></p>';
    h += '<p>甲は前条の顧問料を、' + payDeadMap[payDead] + 'までに、銀行振込により乙の指定する口座に支払うものとする。振込手数料は甲の負担とする。</p>';

    n++;
    h += '<p><strong>第' + n + '条（契約期間）</strong></p>';
    h += '<p>1. 本契約の有効期間は、' + sDate + 'から' + termMap[term] + 'とする。</p>';
    h += '<p>2. 期間満了の1ヶ月前までに甲乙いずれからも書面による終了の意思表示がない場合、本契約は同一条件にてさらに同期間更新されるものとし、以後も同様とする。</p>';

    n++;
    h += '<p><strong>第' + n + '条（中途解約）</strong></p>';
    h += '<p>甲又は乙は、1ヶ月前までに書面により相手方に通知することにより、本契約を解約することができる。この場合、甲は解約日までの顧問料を日割計算により乙に支払うものとする。</p>';

    n++;
    h += '<p><strong>第' + n + '条（秘密保持）</strong></p>';
    h += '<p>1. 甲及び乙は、本契約に関連して知り得た相手方の秘密情報を、相手方の書面による承諾なく第三者に開示・漏洩してはならない。</p>';
    h += '<p>2. 本条の義務は、本契約終了後も5年間存続するものとする。</p>';

    n++;
    h += '<p><strong>第' + n + '条（免責）</strong></p>';
    h += '<p>乙の助言及び指導は、甲の意思決定の参考として提供されるものであり、最終的な判断及びその結果に対する責任は甲に帰属する。ただし、乙の故意又は重大な過失による場合はこの限りでない。</p>';

    n++;
    h += '<p><strong>第' + n + '条（利益相反）</strong></p>';
    h += '<p>乙は、甲の利益に相反する行為を行ってはならない。乙が甲の競合他社と顧問契約を締結する場合は、事前に甲の書面による承諾を得なければならない。</p>';

    n++;
    h += antiSocialClause(n);

    n++;
    h += '<p><strong>第' + n + '条（管轄裁判所）</strong></p>';
    h += '<p>本契約に関する一切の紛争については、' + jur + 'を第一審の専属的合意管轄裁判所とする。</p>';

    n++;
    h += '<p><strong>第' + n + '条（協議事項）</strong></p>';
    h += '<p>本契約に定めのない事項又は解釈に疑義が生じた事項については、甲乙誠意をもって協議し解決を図るものとする。</p>';

    h += signBlock(pA, pAAddr, pB, pBAddr);
    h += '</div>';
    return h;
  };

  // --- Initialize ---
  var currentTemplate = 'outsourcing';

  function setTemplate(key) {
    currentTemplate = key;
    var tmpl = templates[key];
    if (!tmpl) return;

    document.getElementById('templateTitle').textContent = tmpl.title;
    document.getElementById('templateDesc').textContent = tmpl.desc;
    document.getElementById('previewPanel').style.display = 'none';

    document.querySelectorAll('.app-sidebar-item').forEach(function(item) {
      item.classList.remove('active');
      if (item.getAttribute('data-template') === key) {
        item.classList.add('active');
      }
    });

    var formFields = document.getElementById('formFields');
    var buttons = document.querySelector('#contractForm > div:last-child');

    if (formTemplates[key]) {
      formFields.innerHTML = formTemplates[key]();
      document.getElementById('contractForm').style.display = 'block';
      if (buttons) buttons.style.display = 'flex';

      // Auto-calc work hours for employment
      if (key === 'employment') {
        setupWorkHoursCalc();
      }
    }
  }

  function setupWorkHoursCalc() {
    var ws = document.getElementById('workStart');
    var we = document.getElementById('workEnd');
    var bt = document.getElementById('breakTime');
    var wh = document.getElementById('workHours');
    function calc() {
      if (ws && we && bt && wh && ws.value && we.value) {
        var s = ws.value.split(':'), e = we.value.split(':');
        var mins = (parseInt(e[0])*60 + parseInt(e[1])) - (parseInt(s[0])*60 + parseInt(s[1])) - parseInt(bt.value);
        var hours = Math.floor(mins / 60);
        var rm = mins % 60;
        wh.value = hours + '時間' + (rm > 0 ? rm + '分' : '');
      }
    }
    if (ws) ws.addEventListener('change', calc);
    if (we) we.addEventListener('change', calc);
    if (bt) bt.addEventListener('change', calc);
    calc();
  }

  // Sidebar click handlers
  document.querySelectorAll('.app-sidebar-item').forEach(function(item) {
    item.addEventListener('click', function() {
      setTemplate(this.getAttribute('data-template'));
    });
  });

  // Form submission
  document.getElementById('contractForm').addEventListener('submit', function(e) {
    e.preventDefault();

    if (!contractGenerators[currentTemplate]) {
      alert('このテンプレートは現在準備中です。');
      return;
    }

    var html = contractGenerators[currentTemplate]();
    document.getElementById('previewTitle').textContent = templates[currentTemplate].title;
    document.getElementById('previewContent').innerHTML = html;
    document.getElementById('previewPanel').style.display = 'block';
    document.getElementById('previewPanel').scrollIntoView({ behavior: 'smooth' });
  });

  // Edit button
  document.getElementById('editBtn').addEventListener('click', function() {
    document.getElementById('previewPanel').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Copy button
  document.getElementById('copyBtn').addEventListener('click', function() {
    var content = document.getElementById('previewContent').innerText;
    navigator.clipboard.writeText(content).then(function() {
      var btn = document.getElementById('copyBtn');
      var orig = btn.textContent;
      btn.textContent = 'コピーしました';
      setTimeout(function() { btn.textContent = orig; }, 2000);
    });
  });

  // PDF Download
  document.getElementById('downloadPdf').addEventListener('click', function() {
    var printWindow = window.open('', '_blank');
    var content = document.getElementById('previewContent').innerHTML;
    printWindow.document.write('<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>' + templates[currentTemplate].title + '</title><style>@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap");body{font-family:"Noto Sans JP",sans-serif;padding:60px;font-size:14px;line-height:2;color:#1d1d1f;max-width:800px;margin:0 auto;}.article-title{text-align:center;font-size:18px;font-weight:700;margin-bottom:40px;}.article-body p{margin-bottom:14px;}strong{font-weight:700;}@media print{body{padding:40px;}}</style></head><body>' + content + '<div style="margin-top:40px;padding-top:20px;border-top:1px solid #ddd;font-size:11px;color:#999;text-align:center;">本契約書はKeiyakuMakerにより生成されました。重要な契約については専門家にご確認ください。</div></body></html>');
    printWindow.document.close();
    setTimeout(function() { printWindow.print(); }, 500);
  });

  // URL parameter handling
  var params = new URLSearchParams(window.location.search);
  var templateParam = params.get('template');
  if (templateParam && templates[templateParam]) {
    setTemplate(templateParam);
  }

})();
