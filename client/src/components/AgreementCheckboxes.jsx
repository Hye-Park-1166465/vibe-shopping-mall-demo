import './AgreementCheckboxes.css';

function AgreementCheckboxes({ agreements, onAgreementChange }) {
  const handleChange = (name, checked) => {
    if (name === 'all') {
      onAgreementChange({
        all: checked,
        terms: checked,
        privacy: checked,
        marketing: checked
      });
    } else {
      const newAgreements = {
        ...agreements,
        [name]: checked
      };
      newAgreements.all = newAgreements.terms && newAgreements.privacy;
      onAgreementChange(newAgreements);
    }
  };

  return (
    <div className="agreements">
      <div className="agreement-item">
        <input
          type="checkbox"
          id="all"
          checked={agreements.all}
          onChange={(e) => handleChange('all', e.target.checked)}
        />
        <label htmlFor="all">전체 동의</label>
      </div>

      <div className="agreement-item">
        <input
          type="checkbox"
          id="terms"
          checked={agreements.terms}
          onChange={(e) => handleChange('terms', e.target.checked)}
          required
        />
        <label htmlFor="terms">이용약관 동의 (필수)</label>
        <button type="button" className="view-btn">보기</button>
      </div>

      <div className="agreement-item">
        <input
          type="checkbox"
          id="privacy"
          checked={agreements.privacy}
          onChange={(e) => handleChange('privacy', e.target.checked)}
          required
        />
        <label htmlFor="privacy">개인정보처리방침 동의 (필수)</label>
        <button type="button" className="view-btn">보기</button>
      </div>

      <div className="agreement-item">
        <input
          type="checkbox"
          id="marketing"
          checked={agreements.marketing}
          onChange={(e) => handleChange('marketing', e.target.checked)}
        />
        <label htmlFor="marketing">마케팅 정보 수신 동의(선택)</label>
      </div>
    </div>
  );
}

export default AgreementCheckboxes;









