const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { rankSuggestions } = require('./lib/ai/scoring-engine');

async function run() {
  const postName = 'Standard Téléphonique';
  const post = await prisma.post.findFirst({ where: { name: postName }, include: { client: true } });
  if (!post) return console.log("Poste introuvable");

  const start = new Date('2026-03-28');
  const end = new Date('2026-04-03');

  const activePosts = await prisma.post.findMany({ include: { client: true }});
  
  const existingAssignments = await prisma.assignment.findMany({
      where: { date: { gte: start, lte: end } },
      include: { employee: true },
  });

  const dbEmployees = await prisma.employee.findMany({
      where: { isActive: true },
      include: {
        assignments: {
          where: { date: { gte: start, lte: end } }
        },
        absences: {
          where: {
            OR: [
              { startDate: { lte: end }, endDate: { gte: start } }
            ]
          }
        }
      }
  });

  const baseEmployees = dbEmployees.map(emp => ({
      id: emp.id,
      employeeCode: emp.employeeCode,
      firstName: emp.firstName,
      lastName: emp.lastName,
      employeeType: emp.employeeType,
      contractType: 'CDI',
      isActive: emp.isActive,
      languages: emp.languages.map(l => ({ code: l, level: 'FLUENT' })),
      skills: emp.skills,
      certifications: [],
      trainedPosts: emp.trainedPostIds.map(pid => ({ postId: pid, status: 'TRAINED', clientId: '' })),
      acceptedZones: [],
      preferredClientIds: [],
      absenceRate: 0,
      hasVehicle: true,
      weeklyContractHours: emp.weeklyHours || 40,
      weeklyAssignedHours: 0,
      reliabilityScore: 90,
      assignedShifts: emp.assignments.map(a => ({
        postId: a.postId,
        date: a.date.toISOString().split('T')[0],
        startTime: '08:00',
        endTime: '17:00'
      })),
      recentShifts: [],
      absences: emp.absences.map(abs => ({
        startDate: abs.startDate.toISOString().split('T')[0],
        endDate: abs.endDate.toISOString().split('T')[0]
      }))
  }));

  const reqPost = {
      id: post.id,
      name: post.name,
      clientId: post.clientId,
      clientName: post.client.name,
      startTime: post.startTime,
      endTime: post.endTime,
      requiredLanguages: post.requiredLanguages.map(l => ({ 
          code: l, 
          minLevel: 'INTERMEDIATE', 
          priority: 'IMPORTANT' 
      })),
      requiredSkills: post.requiredSkills,
      clientPriority: 'STANDARD',
      zone: 'kirchberg',
      continuitySensitivity: 'MEDIUM',
  };

  const dates = ['2026-03-31', '2026-04-01', '2026-03-30', '2026-03-29'];

  for(const dateStr of dates) {
    console.log(`\nEvaluating candidates for ${postName} on ${dateStr}`);
    
    // Test direct scoring
    let validCount = 0;
    for(const emp of baseEmployees) {
      const { scoreEmployee } = require('./lib/ai/scoring-engine');
      const ctx = {
         post: reqPost,
         date: dateStr,
         strategy: 'BALANCED',
         employee: emp
      };
      
      const res = scoreEmployee(ctx);
      if (res.isEligible) {
         validCount++;
         console.log(` - ELIGIBLE: ${emp.firstName} ${emp.lastName}`);
      } else {
         // console.log(` - INELIGIBLE: ${emp.firstName} ${emp.lastName} -> ${res.eliminationReasons.join(', ')}`);
      }
    }
    console.log(`Total eligible candidates: ${validCount}`);
    
    // Look at first few ineligible
    if(validCount === 0) {
      console.log("Why are they rejected?");
      for(const emp of baseEmployees.slice(0, 5)) {
        const { scoreEmployee } = require('./lib/ai/scoring-engine');
        const res = scoreEmployee({ post: reqPost, date: dateStr, strategy: 'BALANCED', employee: emp });
        console.log(` - ${emp.firstName}: ${res.eliminationReasons.join(', ')}`);
      }
    }
  }

}
run().finally(() => prisma.$disconnect());
