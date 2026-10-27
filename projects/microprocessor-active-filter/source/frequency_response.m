%% Frequency-response graph: measured vs theoretical gain (RC low-pass filter)
clear; clc; close all;

fc = 159.155;                                   % cutoff frequency (Hz)

% Measured / tabulated data (F1-F5)
f_meas     = [39.78 79.58 159.15 238.73 397.88];   % Hz
g_meas_dB  = [-0.28 -0.99 -3.00  -5.10  -8.59];    % dB
g_theo_dB  = [-0.26 -0.97 -3.01  -5.12  -8.60];    % dB

% Smooth theoretical (calculated) curve
f = logspace(log10(10), log10(2000), 600);
g_curve_dB = -10*log10(1 + (f/fc).^2);

%% Plot
fig = figure('Color','w','Position',[100 100 900 550]);
ax = axes(fig); hold(ax,'on'); box(ax,'on');
set(ax,'XScale','log','FontSize',11);

h1 = semilogx(ax, f, g_curve_dB, '-', 'Color',[0.12 0.47 0.71], 'LineWidth',2);
h2 = semilogx(ax, f_meas, g_theo_dB, 's', 'MarkerSize',10, ...
              'MarkerEdgeColor',[0.12 0.47 0.71], 'LineWidth',1.5);
h3 = semilogx(ax, f_meas, g_meas_dB, 'o', 'MarkerSize',7, ...
              'MarkerFaceColor',[0.84 0.15 0.16], 'MarkerEdgeColor',[0.84 0.15 0.16]);
h4 = semilogx(ax, [10 2000], [0 0], ':', 'Color',[0.5 0.5 0.5], 'LineWidth',1.2);
h5 = semilogx(ax, [fc fc], [-12 1.5], 'k--', 'LineWidth',1.2);
semilogx(ax, [10 2000], [-3.01 -3.01], '--', 'Color',[0.2 0.6 0.2]);
h6 = semilogx(ax, fc, -3.01, 'p', 'MarkerSize',16, ...
              'MarkerFaceColor',[1 0.84 0], 'MarkerEdgeColor','k');

% Annotations
text(ax, 300, -1.2, sprintf('-3 dB point\n(%.3f Hz, -3.01 dB)', fc), 'FontSize',10);
annotation_labels = {'F1','F2','F3','F4','F5'};
for k = 1:numel(f_meas)
    text(ax, f_meas(k)*0.85, g_meas_dB(k)-0.7, annotation_labels{k}, ...
         'Color',[0.84 0.15 0.16], 'FontSize',9);
end

% Axes formatting
xlim(ax,[10 2000]); ylim(ax,[-12 1.5]);
set(ax,'XTick',[10 20 50 100 200 500 1000 2000], ...
       'XTickLabel',{'10','20','50','100','200','500','1000','2000'});
grid(ax,'on'); set(ax,'XMinorGrid','on');
xlabel(ax,'Frequency, f (Hz)');
ylabel(ax,'Gain (dB)');
title(ax,'Frequency Response: Measured vs Theoretical Gain');

legend(ax,[h1 h2 h3 h4 h5 h6], ...
    {'Theoretical gain (calculated curve)', ...
     'Theoretical gain (calculated points)', ...
     'Measured gain (F1-F5)', ...
     'Passband level (0 dB)', ...
     sprintf('Cutoff frequency f_c = %.3f Hz', fc), ...
     '-3 dB point'}, 'Location','southwest');

% Export for the report
exportgraphics(fig,'frequency_response_matlab.png','Resolution',300);
