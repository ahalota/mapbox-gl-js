// @flow

import {patternUniformValues} from './pattern.js';
import {
    Uniform1i,
    Uniform1f,
    Uniform2f,
    Uniform3f,
    UniformMatrix4f
} from '../uniform_binding.js';
import {mat3, mat4, vec3} from 'gl-matrix';
import {extend} from '../../util/util.js';
import type Context from '../../gl/context.js';
import type Painter from '../painter.js';
import type {UniformValues} from '../uniform_binding.js';
import type Tile from '../../source/tile.js';
import {CanonicalTileID, OverscaledTileID} from '../../source/tile_id.js';
import EXTENT from '../../style-spec/data/extent.js';

export type FillExtrusionUniformsType = {|
    'u_matrix': UniformMatrix4f,
    'u_lightpos': Uniform3f,
    'u_lightintensity': Uniform1f,
    'u_lightcolor': Uniform3f,
    'u_vertical_gradient': Uniform1f,
    'u_opacity': Uniform1f,
    // globe uniforms:
    'u_tile_id': Uniform3f,
    'u_zoom_transition': Uniform1f,
    'u_inv_rot_matrix': UniformMatrix4f,
    'u_merc_center': Uniform2f,
    'u_up_dir': Uniform3f,
    'u_height_lift': Uniform1f,
    'u_ao': Uniform2f,
    'u_edge_radius': Uniform1f,
    'u_flood_light_color': Uniform3f,
    'u_vertical_scale': Uniform1f,
    'u_flood_light_intensity': Uniform1f,
    'u_ground_shadow_factor': Uniform3f
|};

export type FillExtrusionDepthUniformsType = {|
    'u_matrix': UniformMatrix4f,
    'u_edge_radius': Uniform1f,
    'u_vertical_scale': Uniform1f
|};

export type FillExtrusionPatternUniformsType = {|
    'u_matrix': UniformMatrix4f,
    'u_lightpos': Uniform3f,
    'u_lightintensity': Uniform1f,
    'u_lightcolor': Uniform3f,
    'u_height_factor': Uniform1f,
    'u_vertical_gradient': Uniform1f,
    'u_ao': Uniform2f,
    'u_edge_radius': Uniform1f,
    // globe uniforms:
    'u_tile_id': Uniform3f,
    'u_zoom_transition': Uniform1f,
    'u_inv_rot_matrix': UniformMatrix4f,
    'u_merc_center': Uniform2f,
    'u_up_dir': Uniform3f,
    'u_height_lift': Uniform1f,
    // pattern uniforms:
    'u_texsize': Uniform2f,
    'u_image': Uniform1i,
    'u_pixel_coord_upper': Uniform2f,
    'u_pixel_coord_lower': Uniform2f,
    'u_tile_units_to_pixels': Uniform1f,
    'u_opacity': Uniform1f
|};
export type FillExtrusionGroundEffectUniformsType = {|
    'u_matrix': UniformMatrix4f,
    'u_opacity': Uniform1f,
    'u_ao_pass': Uniform1f,
    'u_meter_to_tile': Uniform1f,
    'u_ao': Uniform2f,
    'u_flood_light_intensity': Uniform1f,
    'u_flood_light_color': Uniform3f,
    'u_attenuation': Uniform1f,
    'u_edge_radius': Uniform1f,
    'u_fb': Uniform1i,
    'u_fb_size': Uniform1f
|};

const fillExtrusionUniforms = (context: Context): FillExtrusionUniformsType => ({
    'u_matrix': new UniformMatrix4f(context),
    'u_lightpos': new Uniform3f(context),
    'u_lightintensity': new Uniform1f(context),
    'u_lightcolor': new Uniform3f(context),
    'u_vertical_gradient': new Uniform1f(context),
    'u_opacity': new Uniform1f(context),
    'u_edge_radius': new Uniform1f(context),
    'u_ao': new Uniform2f(context),
    // globe uniforms:
    'u_tile_id': new Uniform3f(context),
    'u_zoom_transition': new Uniform1f(context),
    'u_inv_rot_matrix': new UniformMatrix4f(context),
    'u_merc_center': new Uniform2f(context),
    'u_up_dir': new Uniform3f(context),
    'u_height_lift': new Uniform1f(context),
    'u_flood_light_color': new Uniform3f(context),
    'u_vertical_scale': new Uniform1f(context),
    'u_flood_light_intensity': new Uniform1f(context),
    'u_ground_shadow_factor': new Uniform3f(context)
});

const fillExtrusionDepthUniforms = (context: Context): FillExtrusionDepthUniformsType => ({
    'u_matrix': new UniformMatrix4f(context),
    'u_edge_radius': new Uniform1f(context),
    'u_vertical_scale': new Uniform1f(context)
});

const fillExtrusionPatternUniforms = (context: Context): FillExtrusionPatternUniformsType => ({
    'u_matrix': new UniformMatrix4f(context),
    'u_lightpos': new Uniform3f(context),
    'u_lightintensity': new Uniform1f(context),
    'u_lightcolor': new Uniform3f(context),
    'u_vertical_gradient': new Uniform1f(context),
    'u_height_factor': new Uniform1f(context),
    'u_edge_radius': new Uniform1f(context),
    'u_ao': new Uniform2f(context),
    // globe uniforms:
    'u_tile_id': new Uniform3f(context),
    'u_zoom_transition': new Uniform1f(context),
    'u_inv_rot_matrix': new UniformMatrix4f(context),
    'u_merc_center': new Uniform2f(context),
    'u_up_dir': new Uniform3f(context),
    'u_height_lift': new Uniform1f(context),
    // pattern uniforms
    'u_image': new Uniform1i(context),
    'u_texsize': new Uniform2f(context),
    'u_pixel_coord_upper': new Uniform2f(context),
    'u_pixel_coord_lower': new Uniform2f(context),
    'u_tile_units_to_pixels': new Uniform1f(context),
    'u_opacity': new Uniform1f(context)
});

const fillExtrusionGroundEffectUniforms = (context: Context): FillExtrusionGroundEffectUniformsType => ({
    'u_matrix': new UniformMatrix4f(context),
    'u_opacity': new Uniform1f(context),
    'u_ao_pass': new Uniform1f(context),
    'u_meter_to_tile': new Uniform1f(context),
    'u_ao': new Uniform2f(context),
    'u_flood_light_intensity': new Uniform1f(context),
    'u_flood_light_color': new Uniform3f(context),
    'u_attenuation': new Uniform1f(context),
    'u_edge_radius': new Uniform1f(context),
    'u_fb': new Uniform1i(context),
    'u_fb_size': new Uniform1f(context)
});

const identityMatrix = mat4.create();

const fillExtrusionUniformValues = (
    matrix: Float32Array,
    painter: Painter,
    shouldUseVerticalGradient: boolean,
    opacity: number,
    aoIntensityRadius: [number, number],
    edgeRadius: number,
    coord: OverscaledTileID,
    heightLift: number,
    zoomTransition: number,
    mercatorCenter: [number, number],
    invMatrix: Float32Array,
    floodLightColor: [number, number, number],
    verticalScale: number,
    floodLightIntensity: number,
    groundShadowFactor: [number, number, number]
): UniformValues<FillExtrusionUniformsType> => {
    const light = painter.style.light;
    const _lp = light.properties.get('position');
    const lightPos = [_lp.x, _lp.y, _lp.z];
    const lightMat = mat3.create();
    const anchor = light.properties.get('anchor');
    if (anchor === 'viewport') {
        mat3.fromRotation(lightMat, -painter.transform.angle);
        vec3.transformMat3(lightPos, lightPos, lightMat);
    }

    const lightColor = light.properties.get('color');
    const tr = painter.transform;

    const uniformValues = {
        'u_matrix': matrix,
        'u_lightpos': lightPos,
        'u_lightintensity': light.properties.get('intensity'),
        'u_lightcolor': [lightColor.r, lightColor.g, lightColor.b],
        'u_vertical_gradient': +shouldUseVerticalGradient,
        'u_opacity': opacity,
        'u_tile_id': [0, 0, 0],
        'u_zoom_transition': 0,
        'u_inv_rot_matrix': identityMatrix,
        'u_merc_center': [0, 0],
        'u_up_dir': [0, 0, 0],
        'u_height_lift': 0,
        'u_ao': aoIntensityRadius,
        'u_edge_radius': edgeRadius,
        'u_flood_light_color': floodLightColor,
        'u_vertical_scale': verticalScale,
        'u_flood_light_intensity': floodLightIntensity,
        'u_ground_shadow_factor': groundShadowFactor
    };

    if (tr.projection.name === 'globe') {
        uniformValues['u_tile_id'] = [coord.canonical.x, coord.canonical.y, 1 << coord.canonical.z];
        uniformValues['u_zoom_transition'] = zoomTransition;
        uniformValues['u_inv_rot_matrix'] = invMatrix;
        uniformValues['u_merc_center'] = mercatorCenter;
        uniformValues['u_up_dir'] = (tr.projection.upVector(new CanonicalTileID(0, 0, 0), mercatorCenter[0] * EXTENT, mercatorCenter[1] * EXTENT): any);
        uniformValues['u_height_lift'] = heightLift;
    }

    return uniformValues;
};

const fillExtrusionDepthUniformValues = (
    matrix: Float32Array,
    edgeRadius: number,
    verticalScale: number
): UniformValues<FillExtrusionDepthUniformsType> => {
    return {
        'u_matrix': matrix,
        'u_edge_radius': edgeRadius,
        'u_vertical_scale': verticalScale
    };
};

const fillExtrusionPatternUniformValues = (
    matrix: Float32Array,
    painter: Painter,
    shouldUseVerticalGradient: boolean,
    opacity: number,
    aoIntensityRadius: [number, number],
    edgeRadius: number,
    coord: OverscaledTileID,
    tile: Tile,
    heightLift: number,
    zoomTransition: number,
    mercatorCenter: [number, number],
    invMatrix: Float32Array,
    floodLightColor: [number, number, number],
    verticalScale: number
): UniformValues<FillExtrusionPatternUniformsType> => {
    const uniformValues = fillExtrusionUniformValues(
        matrix, painter, shouldUseVerticalGradient, opacity, aoIntensityRadius, edgeRadius, coord,
        heightLift, zoomTransition, mercatorCenter, invMatrix, floodLightColor, verticalScale, 1.0, [0, 0, 0]);
    const heightFactorUniform = {
        'u_height_factor': -Math.pow(2, coord.overscaledZ) / tile.tileSize / 8
    };
    return extend(uniformValues, patternUniformValues(painter, tile), heightFactorUniform);
};

const fillExtrusionGroundEffectUniformValues = (
    painter: Painter,
    matrix: Float32Array,
    opacity: number,
    aoPass: boolean,
    meterToTile: number,
    ao: [number, number],
    floodLightIntensity: number,
    floodLightColor: [number, number, number],
    attenuation: number,
    edgeRadius: number,
    fbSize: number
): UniformValues<FillExtrusionGroundEffectUniformsType> => {
    const uniformValues = {
        'u_matrix': matrix,
        'u_opacity': opacity,
        'u_ao_pass': aoPass ? 1 : 0,
        'u_meter_to_tile': meterToTile,
        'u_ao': ao,
        'u_flood_light_intensity': floodLightIntensity,
        'u_flood_light_color': floodLightColor,
        'u_attenuation': attenuation,
        'u_edge_radius': edgeRadius,
        'u_fb': 0,
        'u_fb_size': fbSize
    };
    return uniformValues;
};

export {
    fillExtrusionUniforms,
    fillExtrusionDepthUniforms,
    fillExtrusionPatternUniforms,
    fillExtrusionUniformValues,
    fillExtrusionDepthUniformValues,
    fillExtrusionPatternUniformValues,
    fillExtrusionGroundEffectUniforms,
    fillExtrusionGroundEffectUniformValues
};
