/**
 * Risk Calculator for Buy Now Pay Later (BNPL)
 * Tính toán rủi ro dựa trên thu nhập, số tiền mua, và kỳ hạn
 */

/**
 * Tính điểm rủi ro (0-100)
 * @param {number} customerIncome - Thu nhập hàng tháng của khách hàng
 * @param {number} orderAmount - Số tiền đơn hàng
 * @param {number} installmentPeriod - Kỳ hạn trả góp (tháng)
 * @returns {Object} { riskScore, riskLevel, debtToIncomeRatio }
 */
export function calculateRiskScore(customerIncome, orderAmount, installmentPeriod) {
  if (!customerIncome || customerIncome <= 0) {
    return {
      riskScore: 100,
      riskLevel: 'very_high',
      debtToIncomeRatio: Infinity,
      message: 'Thu nhập không hợp lệ',
    };
  }

  // Tính số tiền trả mỗi tháng (giả sử lãi suất cơ bản 3.5% cho kỳ hạn 3 tháng)
  const baseInterestRate = 0.035; // 3.5% cho 3 tháng
  const interestRatePerMonth = baseInterestRate / 3; // Lãi suất mỗi tháng
  
  // Tính lãi suất theo kỳ hạn (kỳ hạn càng dài, lãi suất càng cao)
  let adjustedInterestRate = baseInterestRate;
  if (installmentPeriod > 3) {
    // Tăng 0.5% cho mỗi 3 tháng thêm
    const additionalMonths = installmentPeriod - 3;
    adjustedInterestRate = baseInterestRate + (additionalMonths / 3) * 0.005;
  }
  
  const totalInterest = orderAmount * adjustedInterestRate;
  const totalAmountWithInterest = orderAmount + totalInterest;
  const monthlyPayment = totalAmountWithInterest / installmentPeriod;

  // Tính tỷ lệ nợ/thu nhập (Debt-to-Income Ratio)
  const debtToIncomeRatio = (monthlyPayment / customerIncome) * 100;

  // Tính điểm rủi ro dựa trên DTI ratio
  let riskScore = 0;
  let riskLevel = 'low';

  if (debtToIncomeRatio <= 10) {
    // DTI <= 10%: Rủi ro thấp
    riskScore = 20;
    riskLevel = 'low';
  } else if (debtToIncomeRatio <= 20) {
    // DTI 10-20%: Rủi ro trung bình thấp
    riskScore = 40;
    riskLevel = 'low';
  } else if (debtToIncomeRatio <= 30) {
    // DTI 20-30%: Rủi ro trung bình
    riskScore = 60;
    riskLevel = 'medium';
  } else if (debtToIncomeRatio <= 40) {
    // DTI 30-40%: Rủi ro cao
    riskScore = 75;
    riskLevel = 'high';
  } else if (debtToIncomeRatio <= 50) {
    // DTI 40-50%: Rủi ro rất cao
    riskScore = 90;
    riskLevel = 'very_high';
  } else {
    // DTI > 50%: Rủi ro cực cao - không nên cho vay
    riskScore = 100;
    riskLevel = 'very_high';
  }

  // Điều chỉnh risk score dựa trên kỳ hạn
  if (installmentPeriod > 12) {
    riskScore += 5; // Kỳ hạn dài hơn 12 tháng tăng rủi ro
  }
  if (installmentPeriod > 18) {
    riskScore += 5;
  }

  // Giới hạn risk score trong khoảng 0-100
  riskScore = Math.min(100, Math.max(0, riskScore));

  // Cập nhật risk level nếu cần
  if (riskScore >= 80) {
    riskLevel = 'very_high';
  } else if (riskScore >= 60) {
    riskLevel = 'high';
  } else if (riskScore >= 40) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  return {
    riskScore: Math.round(riskScore),
    riskLevel,
    debtToIncomeRatio: Math.round(debtToIncomeRatio * 100) / 100,
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalAmountWithInterest: Math.round(totalAmountWithInterest * 100) / 100,
    adjustedInterestRate: Math.round(adjustedInterestRate * 10000) / 100, // Làm tròn đến 0.01%
    message: getRiskMessage(riskLevel, debtToIncomeRatio),
  };
}

/**
 * Tính lãi suất dựa trên risk level và kỳ hạn
 * @param {string} riskLevel - Mức độ rủi ro
 * @param {number} installmentPeriod - Kỳ hạn (tháng)
 * @returns {number} Lãi suất (%)
 */
export function calculateInterestRate(riskLevel, installmentPeriod) {
  // Lãi suất cơ bản theo risk level
  const baseRates = {
    low: 0.025,      // 2.5% cho 3 tháng
    medium: 0.035,   // 3.5% cho 3 tháng
    high: 0.05,      // 5% cho 3 tháng
    very_high: 0.08, // 8% cho 3 tháng
  };

  let baseRate = baseRates[riskLevel] || 0.035;
  
  // Điều chỉnh theo kỳ hạn
  if (installmentPeriod > 3) {
    const additionalMonths = installmentPeriod - 3;
    // Tăng 0.3% cho mỗi 3 tháng thêm
    baseRate += (additionalMonths / 3) * 0.003;
  }

  return Math.round(baseRate * 10000) / 100; // Làm tròn đến 0.01%
}

/**
 * Tính số tiền trả mỗi tháng
 * @param {number} principal - Số tiền gốc
 * @param {number} interestRate - Lãi suất (%)
 * @param {number} installmentPeriod - Kỳ hạn (tháng)
 * @returns {number} Số tiền trả mỗi tháng
 */
export function calculateMonthlyPayment(principal, interestRate, installmentPeriod) {
  const monthlyRate = interestRate / 100 / 12;
  if (monthlyRate === 0) {
    return principal / installmentPeriod;
  }
  
  // Công thức tính trả góp đều: PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, installmentPeriod);
  const denominator = Math.pow(1 + monthlyRate, installmentPeriod) - 1;
  const monthlyPayment = principal * (numerator / denominator);
  
  return Math.round(monthlyPayment * 100) / 100;
}

/**
 * Lấy thông điệp rủi ro
 */
function getRiskMessage(riskLevel, debtToIncomeRatio) {
  const messages = {
    low: `Rủi ro thấp. Tỷ lệ nợ/thu nhập: ${debtToIncomeRatio.toFixed(1)}%`,
    medium: `Rủi ro trung bình. Tỷ lệ nợ/thu nhập: ${debtToIncomeRatio.toFixed(1)}%`,
    high: `Rủi ro cao. Tỷ lệ nợ/thu nhập: ${debtToIncomeRatio.toFixed(1)}%`,
    very_high: `Rủi ro rất cao. Tỷ lệ nợ/thu nhập: ${debtToIncomeRatio.toFixed(1)}%. Không khuyến nghị.`,
  };
  return messages[riskLevel] || messages.medium;
}

/**
 * Kiểm tra xem có thể chấp nhận đơn hàng không
 * @param {number} riskScore - Điểm rủi ro
 * @param {string} riskLevel - Mức độ rủi ro
 * @returns {boolean} true nếu có thể chấp nhận
 */
export function canApproveOrder(riskScore, riskLevel) {
  // Chỉ chấp nhận nếu risk level là low hoặc medium
  // Hoặc risk score < 70
  return riskLevel === 'low' || riskLevel === 'medium' || riskScore < 70;
}
