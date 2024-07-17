package customer.lighthouse.edi.coarri.entities.segment_group;

import java.util.List;

import org.springframework.stereotype.Component;

import customer.lighthouse.edi.coarri.entities.segments.DTM;
import customer.lighthouse.edi.coarri.entities.segments.LOC;
import customer.lighthouse.edi.coarri.entities.segments.RFF;
import customer.lighthouse.edi.coarri.entities.segments.TDT;
import com.fasterxml.jackson.annotation.JsonAlias;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Component
public class SegmentGroup1 {

    @JsonAlias("tdt")
    private TDT detailsOfTransport_TDT;
    @JsonAlias("rff")
    private List<RFF> reference_RFF;
    @JsonAlias("loc")
    private List<LOC> placeLocationIdentification_LOC;
    @JsonAlias("dtm")
    private List<DTM> dateTimePeriod_DTM;

}
