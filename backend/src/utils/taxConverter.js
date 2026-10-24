// taxConverter.js — Tax & Urgency Logic Calculation Engine

const AVG_MOTOR_TAX = 250000;
const AVG_HOUSE_PBB = 150000;
const AVG_COFFEE_TAX = 3000;

const VEHICLE_RATES = {
  none: 0,
  motor_1: 250000,
  motor_2: 500000,
  mobil: 1800000
};

const HOUSE_RATES = {
  kos: 0,
  pribadi_sederhana: 150000,
  pribadi_menengah: 450000
};

/**
 * Enriches a project object with calculated fields, equivalents, and audit status.
 * @param {Object} rawProject
 * @returns {Object} Enriched project
 */
function enrichProjectWithCalculations(rawProject) {
  const total_budget = Number(rawProject.total_budget);
  const local_tax_percentage = Number(rawProject.local_tax_percentage);
  const central_aid_percentage = Number(rawProject.central_aid_percentage);
  const progress_actual = Number(rawProject.progress_actual);
  const progress_planned = Number(rawProject.progress_planned);

  // Statistics
  const population = Number(rawProject.statistics?.population_in_district ?? rawProject.population_in_district ?? 1);
  const daily_users = Number(rawProject.statistics?.daily_users ?? rawProject.daily_users ?? 1);
  const damage_score = Number(rawProject.statistics?.damage_score ?? rawProject.damage_score ?? 0);
  const incident_score = Number(rawProject.statistics?.incident_score ?? rawProject.incident_score ?? 0);
  const density_score = Number(rawProject.statistics?.density_score ?? rawProject.density_score ?? 0);

  // Calculations
  const local_tax_amount = Math.round(total_budget * (local_tax_percentage / 100));
  const central_aid_amount = total_budget - local_tax_amount;
  const progress_deviation = Number((progress_actual - progress_planned).toFixed(2));

  // Determine status dynamically
  let computedStatus = rawProject.status;
  if (!computedStatus) {
    if (progress_deviation >= 0) {
      computedStatus = 'hijau';
    } else if (progress_deviation >= -14) {
      computedStatus = 'kuning';
    } else {
      computedStatus = 'merah';
    }
  }

  // Equivalents
  const motor_tax_count = Math.round(local_tax_amount / AVG_MOTOR_TAX);
  const house_pbb_count = Math.round(local_tax_amount / AVG_HOUSE_PBB);
  const coffee_cup_count = Math.round(local_tax_amount / AVG_COFFEE_TAX);

  // Costs
  const cost_per_citizen = Math.round(local_tax_amount / (population || 1));
  const cost_per_daily_user = Math.round(total_budget / (daily_users || 1));

  // Urgency score: (0.40 * damage) + (0.35 * incident) + (0.25 * density)
  const urgency_score = Math.round((0.40 * damage_score) + (0.35 * incident_score) + (0.25 * density_score));

  // Reports & Verification summary
  const reports = Array.isArray(rawProject.reports) ? rawProject.reports : [];
  let accurate_count = 0;
  let inaccurate_count = 0;

  reports.forEach(r => {
    if (r.is_accurate === true || r.is_accurate === 'true') {
      accurate_count++;
    } else {
      inaccurate_count++;
    }
  });

  const needs_audit = inaccurate_count >= 2;

  return {
    id: Number(rawProject.id),
    title: rawProject.title,
    district: rawProject.district,
    category: rawProject.category,
    total_budget,
    local_tax_percentage,
    central_aid_percentage,
    progress_actual,
    progress_planned,
    status: computedStatus,
    target_completion: rawProject.target_completion instanceof Date 
      ? rawProject.target_completion.toISOString().split('T')[0]
      : String(rawProject.target_completion).split('T')[0],
    contractor_name: rawProject.contractor_name,
    latitude: Number(rawProject.latitude),
    longitude: Number(rawProject.longitude),
    image_url: rawProject.image_url,
    unit_cost_label: rawProject.unit_cost_label,
    median_unit_cost_comparison: rawProject.median_unit_cost_comparison,
    is_overpriced: Boolean(rawProject.is_overpriced),
    statistics: {
      population_in_district: population,
      daily_users,
      damage_points: Number(rawProject.statistics?.damage_points ?? rawProject.damage_points ?? 0),
      incident_count: Number(rawProject.statistics?.incident_count ?? rawProject.incident_count ?? 0),
      incident_label: rawProject.statistics?.incident_label ?? rawProject.incident_label ?? '',
      damage_score,
      incident_score,
      density_score
    },
    reports,
    calculated: {
      local_tax_amount,
      central_aid_amount,
      progress_deviation,
      urgency_score,
      cost_per_citizen,
      cost_per_daily_user,
      equivalents: {
        motor_tax_count,
        house_pbb_count,
        coffee_cup_count
      },
      verification_summary: {
        accurate_count,
        inaccurate_count,
        needs_audit
      }
    }
  };
}

/**
 * Calculates personal tax contribution and compares with a project.
 */
function calculatePersonalTax({ coffee_per_week = 0, vehicle_type = 'none', house_type = 'kos', selected_project_id }, project) {
  const coffee_tax_annual = Math.round(Number(coffee_per_week) * 52 * AVG_COFFEE_TAX);
  const vehicle_tax_annual = VEHICLE_RATES[vehicle_type] ?? 0;
  const house_tax_annual = HOUSE_RATES[house_type] ?? 0;

  const total_annual_tax = coffee_tax_annual + vehicle_tax_annual + house_tax_annual;

  let project_comparison = null;
  if (project) {
    const enriched = enrichProjectWithCalculations(project);
    const local_tax = enriched.calculated.local_tax_amount;
    const contribution_percentage = local_tax > 0 ? Number(((total_annual_tax / local_tax) * 100).toFixed(4)) : 0;
    const citizens_needed = total_annual_tax > 0 ? Math.ceil(local_tax / total_annual_tax) : 0;
    const peer_count = Math.max(0, citizens_needed - 1);

    project_comparison = {
      project_id: enriched.id,
      project_title: enriched.title,
      project_local_tax_amount: local_tax,
      contribution_percentage,
      citizens_needed_like_you: citizens_needed,
      shareable_text: `Kontribusi pajak daerahku sekitar Rp ${new Intl.NumberFormat('id-ID').format(total_annual_tax)}/tahun! Bersama ${peer_count} warga lain dengan kebiasaan serupa, patungan pajak kita setara dengan seluruh dana pajak lokal di proyek ${enriched.title}.`
    };
  }

  return {
    breakdown: {
      coffee_tax_annual,
      vehicle_tax_annual,
      house_tax_annual
    },
    total_annual_tax,
    project_comparison,
    disclaimer: 'Ilustrasi kesetaraan nilai pajak, bukan alokasi langsung per individu karena pajak daerah dikelola melalui Kas Umum Daerah.'
  };
}

module.exports = {
  AVG_MOTOR_TAX,
  AVG_HOUSE_PBB,
  AVG_COFFEE_TAX,
  VEHICLE_RATES,
  HOUSE_RATES,
  enrichProjectWithCalculations,
  calculatePersonalTax
};
