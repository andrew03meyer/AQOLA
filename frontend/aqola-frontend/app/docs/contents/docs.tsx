import ContentsBar from "./ContentsBar";
import { OctagonAlert } from "lucide-react";

const Content = () => {
    return (
        <div className="docs-page">

            {/* ── Heading — natural height, never overlaps ── */}
            <div className="heading">
                <div className="flex-row-centered">
                    <img src="/koala.png" style={{width: "70px", borderRadius:"20px"}} />
                    <div className="tag" style={{margin:"20px"}}>Documentation</div>
                </div>
            </div>

            {/* ── Main content row — fills remaining space ── */}
            <div className="docs-content">
                <ContentsBar />

                <div className="contents-text">

                    {/* Introduction */}
                    <div className="contents-items">
                        <h2 id="introduction">Introduction</h2>
                        <div>
                            This page is here to help you get started with AQOLA; and to provide
                            information on its features, the processes and the data used. AQOLA is
                            designed to provide you (the user) with an ability to show real life
                            datasets, in a readable format. Whether this is performing processes to
                            raw data, or just displaying it in a chart, AQOLA is here to help you
                            with that. We hope you enjoy using it as much as we enjoyed building it!
                        </div>
                    </div>
                    {/* Getting Started */}
                    <div className="contents-items">
                        <h2 id="getting-started">Getting Started</h2>
                        <ul style={{listStyle:"disc"}}>
                            <li>
                                <b className="highlight">Interacting with the map</b> is much like Google/Apple maps. Pinch 
                                 or double tap to zoom, click and drag to move around, click to 
                                 select locations.
                            </li>
                            <li>
                                <b className="highlight">To change dataset</b> (i.e. looking for Flood risk), go 
                                to the top left corner of the screen, and click the dropdown
                                . This should allow you to go between all our available datsets
                            </li>
                            <li>
                                <b className="highlight">To open our graphs</b>, please look at the bottom of your screen, 
                                where you'll see a bar showing all the available charts for that 
                                dataset. On hover, you should be able to see the name of the 
                                chart, which should hopefully give you a good idea of what it's 
                                for.
                            </li>
                            <li>
                                <b className="highlight">To minimise/close charts</b>, click the "-"/"x" in the top right corner of the 
                                chart pop-up. To reopen them. Please click on the graph name, on the right 
                                hand side of the screen. You can also close them from there, using the "x" 
                                button
                            </li>
                            <li>
                                <b className="highlight">To resize graphs</b>, please hover over the bottom right corner of graphs,
                                left click and drag.
                            </li>
                            <li>
                                <b className="highlight">To save your work</b>, please click the download icon in the top left.
                                This will save a local copy of the app state to your PC. You can then 
                                reload this using the upload button. Please note that the download will 
                                not show you graphs in any other software, you have to reload it to our 
                                website.
                            </li>
                        </ul>
                    </div>

                    <div className="contents-items">
                        {/* -------- Terminology ---------- */}
                        <h2 id="terminology">Terminology</h2>
                        <div>
                            <div className="tag"><a href="https://www.ons.gov.uk/methodology/geography/ukgeographies/statisticalgeographies">LSOAS</a> | Lower Layer Super Output Areas</div>
                            <div style={{fontSize:"10px"}}>Typically contains 1,000–3,000 residents or 400–1,200 households</div>
                        </div>
                    </div>

                    <div className="contents-items">
                        {/* -------- API Docs ---------- */}
                        <h3>API Documentation</h3>
                        <div>
                            <a href="http://aqola.andrewmeyer.co.uk:8000/docs">
                                API Documentation
                            </a>
                        </div>
                    </div>

                    {/* {/* -------- Data Section ---------- */}
                    <div className="contents-items">
                        <h2 id="data">Data</h2>
                        <div>
                            Here you will find information about the data used in AQOLA, how
                            it's processed, and where we obtained it.
                        </div>

                        <div className="warning">
                            <OctagonAlert size={40} style={{ marginRight: "5px" }} />
                            <div><b>WARNING: </b> Our data is not live. It may be outdated.</div>
                        </div>

                        {/* -------- Table description ---------- */}
                        <h3>Data Sources</h3>
                        <ul style={{listStyle:"disc"}}>
                            <li><b className="highlight"><i>Dataset</i></b> — what the data is about</li>
                            <li><b className="highlight"><i>Source</i></b> — where the data is obtained from, including a hyperlink to the source</li>
                            <li><b className="highlight"><i>Description</i></b> — a brief description of the dataset, including any relevant details about its content and structure</li>
                            <li><b className="highlight"><i>Date Range</i></b> — the time period covered by the dataset</li>
                            <li><b className="highlight"><i>Data Type</i></b> — the format in which the data is provided (e.g., CSV, JSON, SQL, etc.)</li>
                            <li><b className="highlight"><i>Last Updated</i></b> — the date when we last updated our local copy</li>
                        </ul>


                        {/* -------- Table of Data Sources ---------- */}
                        <table>
                            <thead>
                                <tr>
                                    <th className="highlight">Dataset</th>
                                    <th className="highlight">Source</th>
                                    <th className="highlight">Description</th>
                                    <th className="highlight">Date Range</th>
                                    <th className="highlight">Data Type</th>
                                    <th className="highlight">Last Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Crime</td>
                                    <td><a href="https://data.police.uk/data/">Government Data — Police</a></td>
                                    <td>
                                        Dataset details can be found{" "}
                                        <a href="https://data.police.uk/about/">here</a>.
                                        For our uses, we utilised data from Kent exclusively.
                                    </td>
                                    <td>October 2020 to August 2025</td>
                                    <td>CSV</td>
                                    <td>Late 2025</td>
                                </tr>
                                <tr>
                                    <td>Schools</td>
                                    <td>
                                        <a href="https://www.compare-school-performance.service.gov.uk/schools-by-type?step=default&table=schools&geographic=la&for=primary&region=886&datasetfilter=final">
                                            Government Data — Schools
                                        </a>
                                    </td>
                                    <td>
                                        Download{" "}
                                        <a href="https://www.compare-school-performance.service.gov.uk/download-data">
                                            here
                                        </a>
                                        . For our uses, we utilised data from Kent exclusively.
                                    </td>
                                    <td>2010–2025</td>
                                    <td>CSV</td>
                                    <td>Late 2025</td>
                                </tr>
                                <tr>
                                    <td>Flood</td>
                                    <td><a href="https://data.police.uk/data/">TO BE FILLED OUT</a></td>
                                    <td>TO BE FILLED OUT</td>
                                    <td>XXXX</td>
                                    <td>XXX</td>
                                    <td>XXX</td>
                                </tr>
                                <tr>
                                    <td>House Pricing</td>
                                    <td><a href="https://data.police.uk/data/">TO BE FILLED OUT</a></td>
                                    <td>TO BE FILLED OUT</td>
                                    <td>XXXX</td>
                                    <td>XXX</td>
                                    <td>XXX</td>
                                </tr>
                                <tr>
                                    <td>Housing Developments</td>
                                    <td><a href="https://data.police.uk/data/">TO BE FILLED OUT</a></td>
                                    <td>TO BE FILLED OUT</td>
                                    <td>XXXX</td>
                                    <td>XXX</td>
                                    <td>XXX</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* -------- Charts ---------- */}
                    <div className="contents-items">


                        <h2 id="charts">Charts</h2>
                        <div>
                            Here you will find information about the different charts available
                            in AQOLA, and how to use them.
                        </div>
                        <div>
                            Charts come in two forms. Static and dynamic. Static graphs will 
                            show data, no matter what areas you have selected. Dynamic will 
                            update, based on the areas selected for that dataset.
                        </div>
                        <div>
                            Charts will only update when they are selected (or focused). To 
                            focus a chart, please click on it. The screen should update to 
                            show any areas that graph has already, and then you can add/remove
                            what you want.
                        </div>


                        <h3>Bar Charts</h3>
                        <div>
                            Our bar charts are pretty standard — mostly comprising of a count
                            on the y-axis and a category on the x-axis. We include a legend on
                            the side to help distinguish between different bars, and tooltips
                            for the same reason.
                        </div>
                        <div>
                            In some charts, bars may be grouped along the x-axis to distinguish
                            between different categories — this usually corresponds to the
                            different areas you select.
                        </div>


                        <h3>Line Charts</h3>
                        <div>
                            Like our bar charts, the line charts are also pretty standard. 
                            For most (if not all) charts, the y-axis shows a time period, 
                            and the x-axis shows a count of some sort (i.e. crime count)
                        </div>
                        <div>
                            A number of charts will have multiple lines. These will be to 
                            represent certain categories or locations. These will be shown 
                            in the legend at the side.
                        </div>


                        <h3>Spider Diagrams</h3>
                        <div>
                            These diagrams aim to show a shaded area, based on values for a 
                            number of attributes. Each diagram will have a set of lines, 
                            based on the number of attributes of the datasets and the area 
                            is designed to show the overall performance of over all categories.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Content;