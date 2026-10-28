from fastapi import APIRouter, HTTPException
from app.schemas import SimulationRequest, SimulationResponse
from app.services.simulation_engine import SimulationEngine

router = APIRouter(prefix="/simulate", tags=["Simulation"])

@router.post("", response_model=SimulationResponse)
def simulate_scenario(req: SimulationRequest):
    """
    Run interactive what-if simulation by adjusting inflation, discount rates,
    income replacement duration, budget, and future goals.
    """
    try:
        response = SimulationEngine.run_simulation(req)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
